import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { resolve } from "node:path";

import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { BiomeStorage, Chunk } from "../../chunk";
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

class LevelDBProvider extends WorldProvider {
  public static readonly identifier: string = "leveldb";

  /**
   * The path of the provider.
   */
  public readonly path: string;

  /**
   * The loaded chunks in the provider.
   */
  public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

  public constructor(path: string) {
    super(path);

    // Set the path of the provider.
    this.path = path;
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

    // Call the super shutdown method.
    super.onShutdown();
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
  }

  public readBuffer(_key: string): Buffer {
    return Buffer.alloc(0);
  }

  public writeBuffer(_key: string, _value: Buffer): void {}

  public async readChunk(chunk: Chunk, dimension: Dimension): Promise<Chunk> {
    return await this.handoffReadChunk(chunk, dimension);
  }

  public async writeChunk(
    _chunk: Chunk,
    _dimension: Dimension
  ): Promise<void> {}

  public readChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<CompoundTag> {
    return [];
  }

  public writeChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension,
    _entities: Array<[bigint, CompoundTag]>
  ): void {}

  public readChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<BlockLevelStorage> {
    return [];
  }

  public writeChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension,
    _blocks: Array<BlockLevelStorage>
  ): void {}

  public readPlayer(_uuid: string): CompoundTag | null {
    return null;
  }

  public writePlayer(_uuid: string, _player: CompoundTag): void {}

  public readChunkBiomes(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<BiomeStorage> {
    return [];
  }

  public writeChunkBiomes(_chunk: Chunk, _dimension: Dimension): void {}

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
