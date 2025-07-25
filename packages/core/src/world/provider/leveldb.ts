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
import { BlockPosition, DimensionType } from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import { Chunk, SubChunk } from "../chunk";
import { Dimension } from "../dimension";
import { Serenity } from "../../serenity";
import {
  DimensionProperties,
  WorldProperties,
  WorldProviderProperties
} from "../../types";
import { World } from "../world";
import { ChunkReadySignal, WorldInitializeSignal } from "../../events";
import { Structure } from "../structure";
import { Entity, EntityLevelStorage, PlayerLevelStorage } from "../../entity";
import { Block, BlockLevelStorage } from "../..";

import { WorldProvider } from "./provider";

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
    const dimensions: Array<DimensionProperties> = [
      ...this.world.dimensions.values()
    ].map((dimension) => dimension.properties);

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
    // Read the entities from the chunk.
    const entities = this.readChunkEntities(chunk, dimension);

    // Check if there are any entities in the chunk.
    if (entities.length > 0) {
      // Iterate through the entities and add them to the chunk.
      for (const storage of entities) {
        // Get the entity type from the dimension's entity palette.
        const type = dimension.world.entityPalette.getType(
          storage.getIdentifier()
        );

        // Check if the entity type exists.
        if (!type) {
          // Log a warning if the entity type does not exist.
          this.world.logger.warn(
            `Failed to load entity of type "§u${storage.getIdentifier()}§r" in dimension "§u${dimension.identifier}§r" as the entity type does not exist. Please ensure the entity type is registered in the world entity palette.`
          );

          // Skip to the next entity.
          continue;
        }

        // Create a new entity instance.
        const entity = new Entity(dimension, type, {
          uniqueId: storage.getUniqueId(), // Provide the unique ID from the storage
          storage // Provide the storage for the entity
        });

        // Spawn the entity in the dimension.
        entity.spawn();
      }
    }

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

        // Read the subchunk from the database.
        const subchunk = this.readSubChunk(chunk.x, cy, chunk.z, dimension);

        // Check if the subchunk is empty.
        if (subchunk.isEmpty()) continue;

        // Push the subchunk to the chunk.
        chunk.subchunks[i] = subchunk;
      }

      // Set the chunk as ready.
      chunk.ready = true;

      // Add the chunk to the cache.
      chunks.set(chunk.hash, chunk);

      // Read the blocks from the chunk.
      const blocks = this.readChunkBlocks(chunk, dimension);

      // Check if there are any blocks in the chunk.
      if (blocks.length > 0) {
        // Iterate through the blocks and add them to the chunk.
        for (const storage of blocks) {
          // Create a new block instance of the block permutation.
          const block = new Block(dimension, storage.getPosition(), {
            storage
          });

          // Hash the block position to use as a key.
          const hash = BlockPosition.hash(block.position);

          // Add the block to the dimension blocks collection.
          dimension.blocks.set(hash, block);
        }
      }

      // Return the chunk.
      return chunk;
    } else {
      // Generate a new chunk if it does not exist.
      const resultant = await dimension.generator.apply(chunk.x, chunk.z);

      // Add the chunk to the cache.
      chunks.set(chunk.hash, chunk.insert(resultant));

      // Check if the chunk is ready.
      // If so, emit a new ChunkReadySignal.
      if (chunk.ready) new ChunkReadySignal(dimension, chunk).emit();

      // Return the generated chunk.
      return chunk;
    }
  }

  public async writeChunk(chunk: Chunk, dimension: Dimension): Promise<void> {
    // Get the entities that are in the chunk.
    const entities = dimension
      .getEntities({ chunk })
      .filter((entity) => !entity.isPlayer()) // Remove players from the entities list.
      .map((entity) => entity.getLevelStorage()); // Map the entities to their level storage.

    // Write the chunk entities to the database.
    this.writeChunkEntities(chunk, dimension, entities);

    // Get the blocks that are in the chunk.
    const blocks = [...dimension.blocks]
      .filter(([, block]) => {
        // Convert the block position to chunk coordinates.
        const cx = block.position.x >> 4;
        const cz = block.position.z >> 4;

        // Check if the block is in the chunk.
        if (cx !== chunk.x || cz !== chunk.z) return false;

        // Return true if the block is in the chunk.
        return true;
      })
      .map(([, block]) => block.getLevelStorage()); // Map the blocks to their level storage.

    // Write the block list to the database.
    this.writeChunkBlocks(chunk, dimension, blocks);

    // Check if the chunk is empty.
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
    const key = LevelDBProvider.buildChunkVersionKey(
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
      const key = LevelDBProvider.buildChunkVersionKey(
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
    // Attempt to read the subchunk from the database.
    try {
      // Build the subchunk key for the database.
      const key = LevelDBProvider.buildSubChunkKey(
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
    } catch {
      // If an error occurs, return a new subchunk.
      // These means the subchunk does not exist.
      const subchunk = new SubChunk();

      // Set the chunk y coordinate of the subchunk.
      subchunk.index = cy;

      // Return the new subchunk.
      return subchunk;
    }
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
    const key = LevelDBProvider.buildSubChunkKey(
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
  ): Array<EntityLevelStorage> {
    // Create a key for the chunk entities.
    const entityListKey = LevelDBProvider.buildEntityListKey(chunk, dimension);

    // Attempt to read the entities from the database.
    try {
      // Create a new BinaryStream instance.
      const stream = new BinaryStream(this.db.get(entityListKey));

      // Prepare an array to store the entities.
      const entities = new Array<EntityLevelStorage>();

      // Read all the entities from the stream.
      do {
        // Read the unique identifier from the stream.
        const uniqueId = stream.readInt64(Endianness.Little);

        // Create a key for the entity data.
        const entityKey = LevelDBProvider.buildEntityStorageKey(uniqueId);

        // Read the entity data from the database.
        const storage = EntityLevelStorage.fromBuffer(this.db.get(entityKey));

        // Push the entity storage to the array.
        entities.push(storage);
      } while (!stream.cursorAtEnd());

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
    entities: Array<EntityLevelStorage>
  ): void {
    // Create a key for the chunk entities.
    const entityListKey = LevelDBProvider.buildEntityListKey(chunk, dimension);

    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the unique identifiers of the entities to the stream.
    for (const entity of entities) {
      // Write the unique identifier of the entity to the stream.
      stream.writeInt64(entity.getUniqueId(), Endianness.Little);

      // Build a key for the entity storage.
      const entityStorageKey = LevelDBProvider.buildEntityStorageKey(
        entity.getUniqueId()
      );

      // Get the entity storage buffer.
      const storage = EntityLevelStorage.toBuffer(entity);

      // Write the entity storage to the database.
      this.db.put(entityStorageKey, storage);
    }

    // Write the stream to the database.
    this.db.put(entityListKey, stream.getBuffer());
  }

  public readChunkBlocks(
    chunk: Chunk,
    dimension: Dimension
  ): Array<BlockLevelStorage> {
    // Create a key for the chunk blocks.
    const blockListKey = LevelDBProvider.buildBlockStorageListKey(
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
        const storage = new BlockLevelStorage(compound);

        // Push the block storage to the array.
        blocks.push(storage);
      } while (!stream.cursorAtEnd());

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
    const blockListKey = LevelDBProvider.buildBlockStorageListKey(
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

  public readPlayer(uuid: string): PlayerLevelStorage | null {
    // Attempt to read the player from the database.
    try {
      // Create a key for the player.
      const key = `player_server_${uuid}`;

      // Read the player data from the database.
      const buffer = this.db.get(Buffer.from(key));

      // Create a new BinaryStream instance.
      const stream = new BinaryStream(buffer);

      // Read the player data from the stream.
      const data = new PlayerLevelStorage(CompoundTag.read(stream));

      // Return the player data.
      return data;
    } catch {
      return null;
    }
  }

  public writePlayer(player: PlayerLevelStorage): void {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the level storage data to the stream.
    CompoundTag.write(stream, player);

    // Create a key for the player.
    const key = `player_server_${player.getUuid()}`;

    // Write the player data to the database.
    this.db.put(Buffer.from(key), stream.getBuffer());
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

  /**
   * Build a subchunk key for the database.
   * @param cx The chunk X coordinate.
   * @param cy The subchunk Y coordinate.
   * @param cz The chunk Z coordinate.
   * @param index The dimension index.
   * @returns The buffer key for the subchunk
   */
  public static buildSubChunkKey(
    cx: number,
    cy: number,
    cz: number,
    index: number
  ): Buffer {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the chunk coordinates to the stream.
    stream.writeInt32(cx, Endianness.Little);
    stream.writeInt32(cz, Endianness.Little);

    // Check if the index is not 0.
    if (index !== 0) stream.writeInt32(index, Endianness.Little);

    // Write the query key to the stream.
    stream.writeByte(0x2f);

    // Write the subchunk index to the stream.
    stream.writeByte(cy);

    // Return the buffer from the stream.
    return stream.getBuffer();
  }

  /**
   * Build a chunk version key for the database.
   * @param cx The chunk X coordinate.
   * @param cz The chunk Z coordinate.
   * @param index The dimension index.
   * @returns The buffer key for the chunk version
   */
  public static buildChunkVersionKey(
    cx: number,
    cz: number,
    index: number
  ): Buffer {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the chunk coordinates to the stream.
    stream.writeInt32(cx, Endianness.Little);
    stream.writeInt32(cz, Endianness.Little);

    // Check if the index is not 0.
    if (index !== 0) {
      stream.writeInt32(index, Endianness.Little);
    }

    // Write the chunk version byte to the stream.
    stream.writeByte(0x2c);

    // Return the buffer from the stream
    return stream.getBuffer();
  }

  /**
   * Build an entity list key for the database.
   * @param dimension The dimension to build the key for.
   * @returns The buffer key for the actor list
   */
  public static buildEntityListKey(chunk: Chunk, dimension: Dimension): Buffer {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the key symbol to the stream
    stream.writeInt32(0x64_69_67_70);

    // Check if the index is not 0.
    if (dimension.indexOf() !== 0)
      stream.writeInt32(dimension.indexOf(), Endianness.Little);

    // Write the chunk coordinates to the stream.
    stream.writeInt32(chunk.x, Endianness.Little);
    stream.writeInt32(chunk.z, Endianness.Little);

    // Return the buffer from the stream.
    return stream.getBuffer();
  }

  /**
   * Build an entity storage key for the database.
   * @param uniqueId The unique identifier of the entity.
   * @returns The buffer key for the entity storage
   */
  public static buildEntityStorageKey(uniqueId: bigint): Buffer {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the key symbol to the stream.
    stream.writeBuffer(Buffer.from("actorprefix", "ascii"));

    // Write the unique identifier to the stream.
    stream.writeInt64(uniqueId, Endianness.Little);

    // Return the buffer from the stream.
    return stream.getBuffer();
  }

  public static buildBlockStorageListKey(
    chunk: Chunk,
    dimension: Dimension
  ): Buffer {
    // Create a new BinaryStream instance.
    const stream = new BinaryStream();

    // Write the chunk coordinates to the stream.
    stream.writeInt32(chunk.x, Endianness.Little);
    stream.writeInt32(chunk.z, Endianness.Little);

    // Check if the index is not 0.
    if (dimension.indexOf() !== 0)
      stream.writeUint32(dimension.indexOf(), Endianness.Little);

    // Write the key symbol to the stream.
    stream.writeByte(49); // Block actor list key symbol

    // Return the buffer from the stream.
    return stream.getBuffer();
  }
}

export { LevelDBProvider };
