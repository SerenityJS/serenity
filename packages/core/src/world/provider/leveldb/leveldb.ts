import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve } from "node:path";

import { BinaryStream, Endianness } from "@serenityjs/binarystream";
import { Leveldb } from "@serenityjs/leveldb";
import { DimensionType } from "@serenityjs/protocol";
import { CompoundTag, LongTag } from "@serenityjs/nbt";

import { BiomeStorage, Chunk, SubChunk } from "../../chunk";
import { Dimension } from "../../dimension";
import { Serenity } from "../../../serenity";
import {
  DimensionProperties,
  WorldProperties,
  WorldProviderProperties
} from "../../../types";
import { World } from "../../world";
import { WorldInitializeSignal } from "../../../events";
import { Structure } from "../../structure";
import { BlockLevelStorage } from "../../../block";
import { WorldProvider } from "../provider";

import { LevelDBKeyBuilder } from "./key-builder";

class LevelDBProvider extends WorldProvider {
  public static readonly identifier: string = "leveldb";

  /**
   * The path of the provider.
   */
  public readonly path: string;

  /**
   * The database instance for the provider.
   */
  public readonly db: Leveldb;

  /**
   * The loaded chunks in the provider.
   */
  public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

  public constructor(path: string) {
    super();

    // Set the path of the provider.
    this.path = path;

    // Open the database for the provider
    this.db = Leveldb.open(resolve(path, "db"));
  }

  public onShutdown(): void {
    // Save the world properties to the world directory.
    // First we need to get all the dimension properties.
    const dimensions: Array<DimensionProperties> = [];

    // Iterate through all the dimensions in the world.
    for (const [, dimension] of this.world.dimensions) {
      // Push the dimension properties to the array.
      dimensions.push(dimension.properties);

      // Check if the dimension has a generator with a worker.
      if (dimension.generator.worker) {
        // Terminate the worker thread.
        dimension.generator.worker.terminate();
      }
    }

    // Get the world properties.
    const properties = this.world.properties;
    properties.dimensions = dimensions;

    // Write the properties to the world directory.
    writeFileSync(
      resolve(this.path, "properties.json"),
      JSON.stringify(properties, null, 2)
    );

    // Save all the world data.
    this.onSave();

    // Close the database connection.
    this.db.close();
  }

  public onStartup(): void {
    // Schedule the world to be ready after 80 ticks.
    const schedule = this.world.schedule(80);

    // Create a new method to hold the pregeneration logic.
    const pregenerate = () => {
      // Pregenerate the dimensions for the world.
      for (const [, dimension] of this.world.dimensions) {
        // Get the spawn position of the dimension.
        const sx = dimension.properties.spawnPosition[0] >> 4;
        const sz = dimension.properties.spawnPosition[2] >> 4;

        // Get the view distance of the dimension.
        const viewDistance = dimension.viewDistance;

        // Prepare the amount of chunks to pregenerate.
        let chunkCount: number = 0;

        // Iterate through the chunks to pregenerate.
        for (let x = sx - viewDistance; x <= sx + viewDistance; x++) {
          for (let z = sz - viewDistance; z <= sz + viewDistance; z++) {
            // Create a new chunk instance.
            const chunk = new Chunk(x, z, dimension.type);

            // Read the chunk from the filesystem.
            this.readChunk(chunk, dimension);

            // Increment the count of pregenerated chunks.
            chunkCount++;
          }
        }

        // Get the amount of entities and blocks in the dimension.
        const entityCount = dimension.entities.size;
        const blockCount = dimension.blocks.size;

        // Log the amount of chunks to pregenerate.
        this.world.logger.info(
          `Successfully pre-generated §u${chunkCount}§r chunks for dimension §u${dimension.identifier}§r which contains §u${entityCount}§r entities and §u${blockCount}§r blocks.`
        );
      }
    };

    // Call the pregenerate method immediately.
    schedule.on(pregenerate);
  }

  public onSave(): void {
    // Iterate through the chunks and write them to the database.
    // Iterate through all the dimensions in the chunks map.
    for (const [dimension, chunks] of this.chunks) {
      // Iterate through all the chunks in the dimension's chunk map.
      for (const chunk of chunks.values()) {
        // Write the chunk to the filesystem.
        this.writeChunk(chunk, dimension);
      }
    }

    // Flush the database to ensure all data is written.
    return this.db.flush();
  }

  public readBuffer(key: string): Buffer {
    return this.db.get(Buffer.from(key));
  }

  public writeBuffer(key: string, value: Buffer): void {
    this.db.put(Buffer.from(key), value);
  }

  public async readChunk(chunk: Chunk, dimension: Dimension): Promise<Chunk> {
    // Check if the chunks contain the dimension.
    if (!this.chunks.has(dimension)) {
      this.chunks.set(dimension, new Map());
    }

    // Get the dimension chunks.
    const chunks = this.chunks.get(dimension) as Map<bigint, Chunk>;

    // Check if the cache contains the chunk.
    if (chunks.has(chunk.hash)) return chunks.get(chunk.hash) as Chunk;
    // Check if the leveldb contains the chunk.
    else if (this.hasChunk(chunk.x, chunk.z, dimension)) {
      // Iterate through the subchunks of the chunk.
      for (let i = 0; i < Chunk.MAX_SUB_CHUNKS; i++) {
        // Prepare an offset variable.
        // This is used to adjust the index for overworld dimensions.
        let offset = 0;

        // Check if the dimension type is overworld.
        if (chunk.type === DimensionType.Overworld) offset = 4; // Adjust index for overworld

        // Calculate the subchunk Y coordinate.
        const cy = i - offset;

        // Attempt to read the subchunk from the database.
        try {
          // Read the subchunk from the database.
          const subchunk = this.readSubChunk(chunk.x, cy, chunk.z, dimension);

          // Check if the subchunk is empty.
          if (subchunk.isEmpty()) continue;

          // Push the subchunk to the chunk.
          chunk.subchunks[i] = subchunk;
        } catch {
          // We can ignore any error that occurs while reading the subchunk.
          continue;
        }
      }

      // Read the biomes from the chunk.
      const biomes = this.readChunkBiomes(chunk, dimension);

      // Iterate through the biomes and add them to the chunk.
      for (let i = 0; i < biomes.length; i++) {
        // Get the corresponding subchunk and biome.
        const subchunk = chunk.subchunks[i];
        const biome = biomes[i];

        // Check if the subchunk and biome exist.
        if (!subchunk || !biome) continue;

        // Set the biome storage of the subchunk.
        subchunk.biomes = biome;
      }

      // Read the entities from the database.
      const entities = this.readChunkEntities(chunk, dimension);

      // Check if there are any entities in the chunk.
      if (entities.length > 0) {
        // Iterate through the entities and add them to the chunk.
        for (const storage of entities) {
          // Get the unique id of the entity.
          const uniqueId = storage.get<LongTag>("UniqueID");

          // Skip if the unique id does not exist.
          if (!uniqueId) continue;

          // Set the entity storage in the chunk.
          chunk.setEntityStorage(BigInt(uniqueId.valueOf()), storage, false);
        }
      }

      // Read the blocks from the chunk.
      const blocks = this.readChunkBlocks(chunk, dimension);

      // Check if there are any blocks in the chunk.
      if (blocks.length > 0) {
        // Iterate through the blocks and add them to the chunk.
        for (const storage of blocks) {
          // Set the block storage in the chunk.
          chunk.setBlockStorage(storage.getPosition(), storage, false);
        }
      }

      // Add the chunk to the cache.
      chunks.set(chunk.hash, chunk);

      // Return the chunk.
      return chunk;
    } else {
      // Generate a new chunk if it does not exist.
      const resultant = await dimension.generator.apply(chunk.x, chunk.z);

      // Read the entities from the database.
      const entities = this.readChunkEntities(chunk, dimension);

      // Check if there are any entities in the chunk.
      if (entities.length > 0) {
        // Iterate through the entities and add them to the chunk.
        for (const storage of entities) {
          // Get the unique id of the entity.
          const uniqueId = storage.get<LongTag>("UniqueID");

          // Skip if the unique id does not exist.
          if (!uniqueId) continue;

          // Set the entity storage in the chunk.
          chunk.setEntityStorage(BigInt(uniqueId.valueOf()), storage, false);
        }
      }

      // Add the chunk to the cache.
      chunks.set(chunk.hash, chunk.insert(resultant));

      // Call the populate method of the dimension generator.
      await dimension.generator.populate?.(chunk);

      // Return the generated chunk.
      return chunk;
    }
  }

  public async writeChunk(chunk: Chunk, dimension: Dimension): Promise<void> {
    // Get the entities that are in the chunk.
    const entities = chunk.getAllEntityStorages();

    // Write the chunk entities to the database, regardless of dirty state.
    this.writeChunkEntities(chunk, dimension, entities);

    // Get the blocks that are in the chunk.
    const blocks = chunk
      .getAllBlockStorages()
      .filter((storage) => storage.size > 0); // Filter out empty block storages.

    // Write the block list to the database.
    this.writeChunkBlocks(chunk, dimension, blocks);

    // Check if the chunk is empty and not dirty
    if (chunk.isEmpty() || !chunk.dirty) return;

    // Write the chunk version, in this case will be 40
    this.writeChunkVersion(chunk.x, chunk.z, dimension, 40);

    // Iterate through the chunks and write them to the database.
    // TODO: Dimensions can have a data driven min and max subchunk value, we should use that.
    for (let cy = 0; cy < Chunk.MAX_SUB_CHUNKS; cy++) {
      // Prepare an offset variable.
      // This is used to adjust the index for overworld dimensions.
      let offset = 0;

      // Check if the dimension type is overworld.
      if (chunk.type === DimensionType.Overworld) offset = 4; // Adjust index for overworld

      // Get the subchunk from the chunk.
      const subchunk = chunk.getSubChunk(cy - offset);

      // Check if the subchunk is empty.
      if (!subchunk || subchunk.isEmpty()) continue;

      // Write the subchunk to the database.
      this.writeSubChunk(subchunk, chunk.x, cy - offset, chunk.z, dimension);
    }

    // Write the chunk biomes to the database.
    this.writeChunkBiomes(chunk, dimension);

    // Set the chunk as not dirty.
    chunk.dirty = false;
  }

  /**
   * Write the chunk version to the database.
   * @param cx The chunk X coordinate.
   * @param cz The chunk Z coordinate.
   * @param index The dimension index.
   * @param version The chunk version.
   */
  public writeChunkVersion(
    cx: number,
    cz: number,
    dimension: Dimension,
    version: number
  ): void {
    // Create a key for the chunk version
    const key = LevelDBKeyBuilder.buildChunkVersionKey(
      cx,
      cz,
      dimension.indexOf()
    );

    // Write the chunk version to the database.
    this.db.put(key, Buffer.from([version]));
  }

  /**
   * Checks if the database has a chunk.
   * @param cx The chunk X coordinate.
   * @param cz The chunk Z coordinate.
   * @param dimension The dimension to check for the chunk.
   */
  public hasChunk(cx: number, cz: number, dimension: Dimension): boolean {
    try {
      // Create a key for the chunk version.
      const key = LevelDBKeyBuilder.buildChunkVersionKey(
        cx,
        cz,
        dimension.indexOf()
      );

      // Check if the key exists in the database.
      const data = this.db.get(key);
      if (data) return true;

      // Return false if the chunk does not exist.
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Reads a subchunk from the database.
   * @param cx The chunk X coordinate.
   * @param cy The subchunk Y coordinate.
   * @param cz The chunk Z coordinate.
   * @param dimension The dimension to read the subchunk from.
   * @returns The subchunk from the database.
   */
  public readSubChunk(
    cx: number,
    cy: number,
    cz: number,
    dimension: Dimension
  ): SubChunk {
    // Build the subchunk key for the database.
    const key = LevelDBKeyBuilder.buildSubChunkKey(
      cx,
      cy,
      cz,
      dimension.indexOf()
    );

    // Deserialize the subchunk from the database.
    const subchunk = SubChunk.from(this.db.get(key), true);

    // Set the chunk y coordinate of the subchunk.
    subchunk.index = cy;

    // Return the subchunk from the database.
    return subchunk;
  }

  /**
   * Writes a subchunk to the database.
   * @param subchunk The subchunk to write.
   * @param cx The chunk X coordinate.
   * @param cy The subchunk Y coordinate.
   * @param cz The chunk Z coordinate.
   * @param dimension The dimension to write the subchunk to.
   */
  public writeSubChunk(
    subchunk: SubChunk,
    cx: number,
    cy: number,
    cz: number,
    dimension: Dimension
  ): void {
    // Create a key for the subchunk.
    const key = LevelDBKeyBuilder.buildSubChunkKey(
      cx,
      cy,
      cz,
      dimension.indexOf()
    );

    // Serialize the subchunk to a buffer
    const stream = new BinaryStream();
    SubChunk.serialize(subchunk, stream, true);

    // Write the subchunk to the database
    this.db.put(key, stream.getBuffer());
  }

  public readChunkEntities(
    chunk: Chunk,
    dimension: Dimension
  ): Array<CompoundTag> {
    // Create a key for the chunk entities.
    const entityListKey = LevelDBKeyBuilder.buildEntityListKey(
      chunk,
      dimension
    );

    // Attempt to read the entities from the database.
    try {
      // Create a new BinaryStream instance.
      const stream = new BinaryStream(this.db.get(entityListKey));

      // Prepare an array to store the entities.
      const entities = new Array<CompoundTag>();

      // Read all the entities from the stream.
      do {
        // Read the unique identifier from the stream.
        const uniqueId = stream.readInt64(Endianness.Little);

        // Create a key for the entity data.
        const entityKey = LevelDBKeyBuilder.buildEntityStorageKey(uniqueId);

        // Read the player data from the database.
        const buffer = this.db.get(entityKey);

        // Create a new BinaryStream instance.
        const storageStream = new BinaryStream(buffer);

        // Read the player data from the stream.
        const storage = CompoundTag.read(storageStream);

        // Push the entity storage to the array.
        entities.push(storage);
      } while (!stream.feof());

      // Return the entities from the database.
      return entities;
    } catch {
      // We can ignore any error that occurs while reading the entities.
      // This can happen if the entity list does not exist or is empty.

      // Return an empty array if an error occurs.
      return [];
    }
  }

  public writeChunkEntities(
    chunk: Chunk,
    dimension: Dimension,
    entities: Array<[bigint, CompoundTag]>
  ): void {
    // Create a key for the chunk entities.
    const entityListKey = LevelDBKeyBuilder.buildEntityListKey(
      chunk,
      dimension
    );

    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the unique identifiers of the entities to the stream.
    for (const [uniqueId, storage] of entities) {
      // Write the unique identifier of the entity to the stream.
      stream.writeInt64(uniqueId, Endianness.Little);

      // Build a key for the entity storage.
      const entityStorageKey =
        LevelDBKeyBuilder.buildEntityStorageKey(uniqueId);

      // Create a new BinaryStream instance.
      const storageStream = new BinaryStream();

      // Write the entity storage to a buffer stream.
      CompoundTag.write(storageStream, storage);

      // Write the entity storage to the database.
      this.db.put(entityStorageKey, storageStream.getBuffer());
    }

    // Write the stream to the database.
    this.db.put(entityListKey, stream.getBuffer());
  }

  public readChunkBlocks(
    chunk: Chunk,
    dimension: Dimension
  ): Array<BlockLevelStorage> {
    // Create a key for the chunk blocks.
    const blockListKey = LevelDBKeyBuilder.buildBlockStorageListKey(
      chunk,
      dimension
    );

    // Attempt to read the blocks from the database.
    try {
      // Create a new BinaryStream instance.
      const stream = new BinaryStream(this.db.get(blockListKey));

      // Prepare an array to store the blocks.
      const blocks = new Array<BlockLevelStorage>();

      // Read all the blocks from the stream.
      do {
        // Read the compound tag from the stream.
        const compound = CompoundTag.read(stream);

        // Convert the compound tag to a BlockLevelStorage instance.
        const storage = new BlockLevelStorage(chunk, compound);

        // Push the block storage to the array.
        blocks.push(storage);
      } while (!stream.feof());

      // Return the blocks from the database.
      return blocks;
    } catch {
      // We can ignore any error that occurs while reading the blocks.
      // This can happen if the block list does not exist or is empty.

      // Return an empty array if an error occurs.
      return [];
    }
  }

  public writeChunkBlocks(
    chunk: Chunk,
    dimension: Dimension,
    blocks: Array<BlockLevelStorage>
  ): void {
    // Create a key for the chunk blocks.
    const blockListKey = LevelDBKeyBuilder.buildBlockStorageListKey(
      chunk,
      dimension
    );

    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the blocks to the stream.
    for (const block of blocks) {
      // Write the block storage to the stream.
      CompoundTag.write(stream, block);
    }

    // Write the stream to the database.
    this.db.put(blockListKey, stream.getBuffer());
  }

  public readPlayer(uuid: string): CompoundTag | null {
    // Attempt to read the player from the database.
    try {
      // Create a key for the player.
      const key = `player_server_${uuid}`;

      // Read the player data from the database.
      const buffer = this.db.get(Buffer.from(key));

      // Create a new BinaryStream instance.
      const stream = new BinaryStream(buffer);

      // Read the player data from the stream.
      const data = CompoundTag.read(stream);

      // Return the player data.
      return data;
    } catch {
      return null;
    }
  }

  public writePlayer(uuid: string, player: CompoundTag): void {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the level storage data to the stream.
    CompoundTag.write(stream, player);

    // Create a key for the player.
    const key = `player_server_${uuid}`;

    // Write the player data to the database.
    this.db.put(Buffer.from(key), stream.getBuffer());
  }

  public readChunkBiomes(
    chunk: Chunk,
    dimension: Dimension
  ): Array<BiomeStorage> {
    // Create a key for the chunk biomes.
    const biomeListKey = LevelDBKeyBuilder.buildBiomeStorageKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );

    // Attempt to read the biomes from the database.
    try {
      // Prepare an array to store the biome storages.
      const biomes = new Array<BiomeStorage>();

      // Create a new BinaryStream instance from the database.
      const stream = new BinaryStream(this.db.get(biomeListKey));

      stream.read(512); // Heightmap (not used currently)

      // Iterate through the subchunks of the chunk.
      for (let i = 0; i < chunk.subchunks.length; i++) {
        // Read the biome storage from the stream.
        const storage = BiomeStorage.deserialize(stream, true);

        // Push the biome storage to the array.
        biomes.push(storage);
      }

      // Return the biome storages.
      return biomes;
    } catch {
      // Return an empty array if an error occurs.
      return [];
    }
  }

  public writeChunkBiomes(chunk: Chunk, dimension: Dimension): void {
    // Create a key for the chunk biomes.
    const biomeListKey = LevelDBKeyBuilder.buildBiomeStorageKey(
      chunk.x,
      chunk.z,
      dimension.indexOf()
    );

    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    stream.write(Buffer.alloc(512)); // Heightmap (not used currently)

    // Iterate through the subchunks of the chunk.
    for (const subchunk of chunk.subchunks) {
      // Write the biome storage to the stream.
      BiomeStorage.serialize(subchunk.biomes, stream, true);
    }

    // Write the stream to the database.
    this.db.put(biomeListKey, stream.getBuffer());
  }

  public static async initialize(
    serenity: Serenity,
    properties: WorldProviderProperties
  ): Promise<void> {
    // Resolve the path for the worlds directory.
    const path = resolve(properties.path);

    // Check if the path provided exists.
    // If it does not exist, create the directory.
    if (!existsSync(path)) mkdirSync(path);

    // Read all the directories in the world directory.
    // Excluding file types, as a world entry is a directory.
    const directories = readdirSync(path, { withFileTypes: true }).filter(
      (dirent) => dirent.isDirectory()
    );

    // Check if the directory is empty.
    // If it is, create a new world with the default identifier.
    if (directories.length === 0) {
      serenity.registerWorld(
        await this.create(serenity, properties, { identifier: "default" })
      );

      return;
    }

    // Iterate over the world entries in the directory.
    for (const directory of directories) {
      // Get the path for the world.
      const worldPath = resolve(path, directory.name);

      // Get the world properties.
      let properties: Partial<WorldProperties> = { identifier: directory.name };
      if (existsSync(resolve(worldPath, "properties.json"))) {
        // Read the properties of the world.
        properties = JSON.parse(
          readFileSync(resolve(worldPath, "properties.json"), "utf-8")
        );
      }

      // Check if the world directory contains a structures directory.
      if (!existsSync(resolve(worldPath, "structures")))
        // Create the structures directory if it does not exist.
        mkdirSync(resolve(worldPath, "structures"));

      // Create a new world instance.
      const world = new World(serenity, new this(worldPath), properties);

      // Create a new WorldInitializedSignal instance.
      new WorldInitializeSignal(world).emit();

      // Write the properties to the world.
      writeFileSync(
        resolve(worldPath, "properties.json"),
        JSON.stringify(world.properties, null, 2)
      );

      // Read all the structures in the world directory.
      const files = readdirSync(resolve(worldPath, "structures"), {
        withFileTypes: true
      }).filter(
        // Filter only files that end with .mcstructure.
        (dirent) => dirent.isFile() && dirent.name.endsWith(".mcstructure")
      );

      // Attempt to read the structures from the world directory.
      for (const file of files) {
        try {
          // Create the structure from the file.
          const path = resolve(worldPath, "structures", file.name);

          // Read the structure file.
          const stream = new BinaryStream(readFileSync(path));

          // Create a new structure instance from the file.
          const structure = Structure.from(world, CompoundTag.read(stream));

          // Parse the identifier from the file name.
          const identifier = file.name.replace(/\.mcstructure$/, "");

          // Add the structure to the world.
          world.structures.set(identifier, structure);

          // Log a debug message indicating the structure was loaded.
          world.logger.debug(
            `Loaded structure "${identifier}" from file "${file.name}" for world "${world.properties.identifier}."`
          );
        } catch (reason) {
          // Log the error if the structure failed to load.
          world.logger.error(
            `Failed to load structure from file ${file.name} for world ${world.properties.identifier}. Reason:`,
            reason
          );
        }
      }

      // Register the world with the serenity instance.
      serenity.registerWorld(world);
    }
  }

  public static async create(
    serenity: Serenity,
    properties: WorldProviderProperties,
    worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    // Resolve the path for the worlds directory.
    const path = resolve(properties.path);

    // Check if the path provided exists.
    // If it does not exist, create the directory.
    if (!existsSync(path)) mkdirSync(path);

    // Check if a world identifier was provided.
    if (!worldProperties?.identifier)
      throw new Error("A world identifier is required to create a new world.");

    // Get the world path from the properties.
    const worldPath = resolve(path, worldProperties.identifier);

    // Check if the world already exists.
    if (existsSync(worldPath))
      throw new Error(
        `World with identifier ${worldProperties.identifier} already exists in the directory.`
      );

    // Create the world directory.
    mkdirSync(worldPath);

    // Create a new world instance.
    const world = new World(serenity, new this(worldPath), worldProperties);

    // Assign the world to the provider.
    world.provider.world = world;

    // Create a new WorldInitializedSignal instance.
    new WorldInitializeSignal(world).emit();

    // Create the properties file for the world.
    writeFileSync(
      resolve(worldPath, "properties.json"),
      JSON.stringify(world.properties, null, 2)
    );

    // Return the created world.
    return world;
  }

  public static async loadFromExistingPath(
    serenity: Serenity,
    path: string
  ): Promise<World> {
    // Resolve the path for the world directory.
    path = resolve(path);

    // Check if the path provided exists.
    // If it does not exist, throw an error.
    if (!existsSync(path))
      throw new Error(
        `World directory at path ${path} does not exist, try creating it instead.`
      );

    // Get the world properties.
    let worldProperties: Partial<WorldProperties> = {};
    if (existsSync(resolve(path, "properties.json"))) {
      // Read the properties of the world.
      worldProperties = JSON.parse(
        readFileSync(resolve(path, "properties.json"), "utf-8")
      );
    }

    // Check if a world identifier was provided.
    if (!worldProperties.identifier)
      throw new Error(
        `World at path ${path} does not have a valid identifier in its properties file.`
      );

    // Create a new world instance.
    const world = new World(serenity, new this(path), worldProperties);

    // Create a new WorldInitializedSignal instance.
    new WorldInitializeSignal(world).emit();

    // Return the loaded world.
    return world;
  }

  public static async createFromGivenPath(
    serenity: Serenity,
    path: string,
    worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    // Resolve the path for the world directory.
    path = resolve(path);

    // Check if the path provided exists.
    // If it does exist, throw an error.
    if (existsSync(path))
      throw new Error(
        `World directory at path ${path} already exists, try loading it instead.`
      );

    // Check if a world identifier was provided.
    if (!worldProperties?.identifier)
      throw new Error("A world identifier is required to create a new world.");

    // Create the world directory.
    mkdirSync(path, { recursive: true });

    // Create a new world instance.
    const world = new World(serenity, new this(path), worldProperties);

    // Assign the world to the provider.
    world.provider.world = world;

    // Create a new WorldInitializedSignal instance.
    new WorldInitializeSignal(world).emit();

    // Create the properties file for the world.
    writeFileSync(
      resolve(path, "properties.json"),
      JSON.stringify(world.properties, null, 2)
    );

    // Return the created world.
    return world;
  }
}

export { LevelDBProvider };
