// import { resolve } from "node:path";
// import {
//   existsSync,
//   mkdirSync,
//   readdirSync,
//   readFileSync,
//   rmSync,
//   writeFileSync
// } from "node:fs";

// import { BinaryStream } from "@serenityjs/binarystream";
// import { CompoundTag, ListTag } from "@serenityjs/nbt";
// import { BlockPosition } from "@serenityjs/protocol";

// import { Serenity } from "../../serenity";
// import {
//   WorldProviderProperties,
//   WorldProperties,
//   DimensionProperties
// } from "../../types";
// import { World } from "../world";
// import { ChunkReadySignal, WorldInitializeSignal } from "../../events";
// import { Structure } from "../structure";
// import { Entity, EntityLevelStorage, PlayerLevelStorage } from "../../entity";
// import { Chunk } from "../chunk";
// import { Dimension } from "../dimension";
// import { Block, BlockLevelStorage } from "../../block";

// import { WorldProvider } from "./provider";

// class FileSystemProvider extends WorldProvider {
//   public static readonly identifier: string = "filesystem";

//   /**
//    * The path to the world directory.
//    */
//   public readonly path: string;

//   /**
//    * The cached chunks for the provider.
//    */
//   public readonly chunks = new Map<Dimension, Map<bigint, Chunk>>();

//   /**
//    * Create a new filesystem provider.
//    * @param path The path to the world directory.
//    */
//   public constructor(path: string) {
//     super();

//     // Set the path for the filesystem provider
//     this.path = path;
//   }

//   public onStartup(): void {
//     // Pregenerate the dimensions for the world.
//     for (const [, dimension] of this.world.dimensions) {
//       // Get the spawn position of the dimension.
//       const sx = dimension.properties.spawnPosition[0] >> 4;
//       const sz = dimension.properties.spawnPosition[2] >> 4;

//       // Get the view distance of the dimension.
//       const viewDistance = dimension.viewDistance;

//       // Prepare the amount of chunks to pregenerate.
//       let chunkCount: number = 0;

//       // Iterate through the chunks to pregenerate.
//       for (let x = sx - viewDistance; x <= sx + viewDistance; x++) {
//         for (let z = sz - viewDistance; z <= sz + viewDistance; z++) {
//           // Create a new chunk instance.
//           const chunk = new Chunk(x, z, dimension.type);

//           // Read the chunk from the filesystem.
//           this.readChunk(chunk, dimension);

//           // Increment the count of pregenerated chunks.
//           chunkCount++;
//         }
//       }

//       // Get the amount of entities and blocks in the dimension.
//       const entityCount = dimension.entities.size;
//       const blockCount = dimension.blocks.size;

//       // Log the amount of chunks to pregenerate.
//       this.world.logger.info(
//         `Successfully pre-generated §u${chunkCount}§r chunks for dimension §u${dimension.identifier}§r which contains §u${entityCount}§r entities and §u${blockCount}§r blocks.`
//       );
//     }
//   }

//   public onShutdown(): void {
//     // Save the world properties to the world directory.
//     // First we need to get all the dimension properties.
//     const dimensions: Array<DimensionProperties> = [
//       ...this.world.dimensions.values()
//     ].map((dimension) => dimension.properties);

//     // Get the world properties.
//     const properties = this.world.properties;
//     properties.dimensions = dimensions;

//     // Write the properties to the world directory.
//     writeFileSync(
//       resolve(this.path, "properties.json"),
//       JSON.stringify(properties, null, 2)
//     );

//     // Save the provider state.
//     this.onSave();
//   }

//   public onSave(): void {
//     // Iterate through all the dimensions in the chunks map.
//     for (const [dimension, chunks] of this.chunks) {
//       // Iterate through all the chunks in the dimension's chunk map.
//       for (const chunk of chunks.values()) {
//         // Write the chunk to the filesystem.
//         this.writeChunk(chunk, dimension);
//       }
//     }
//   }

//   public async readChunk(chunk: Chunk, dimension: Dimension): Promise<Chunk> {
//     // Read the entities from the chunk.
//     const entities = this.readChunkEntities(chunk, dimension);

//     // Check if there are any entities in the chunk.
//     if (entities.length > 0) {
//       // Iterate through the entities and add them to the chunk.
//       for (const storage of entities) {
//         // Get the entity type from the dimension's entity palette.
//         const type = dimension.world.entityPalette.getType(
//           storage.getIdentifier()
//         );

//         // Check if the entity type exists.
//         if (!type) {
//           // Log a warning if the entity type does not exist.
//           this.world.logger.warn(
//             `Failed to load entity of type "§u${storage.getIdentifier()}§r" in dimension "§u${dimension.identifier}§r" as the entity type does not exist. Please ensure the entity type is registered in the world entity palette.`
//           );

//           // Skip to the next entity.
//           continue;
//         }

//         // Create a new entity instance.
//         const entity = new Entity(dimension, type, {
//           storage // Provide the storage for the entity
//         });

//         // Spawn the entity in the dimension.
//         entity.spawn();
//       }
//     }

//     // Check if the dimension exists in the chunks map.
//     if (!this.chunks.has(dimension)) {
//       // If not, create a new map for the dimension.
//       this.chunks.set(dimension, new Map());
//     }

//     // Get the dimension's chunk map.
//     const chunks = this.chunks.get(dimension)!;

//     // Check if the chunk already exists in the dimension's chunk map.
//     if (chunks.has(chunk.hash)) return chunks.get(chunk.hash)!;
//     else {
//       // Get the path for the chunk file.
//       const path = resolve(
//         this.path,
//         "dimensions",
//         dimension.identifier,
//         "chunks",
//         `${chunk.x}.${chunk.z}.dat`
//       );

//       // Check if the chunk file exists.
//       if (existsSync(path)) {
//         // Read the chunk file into a buffer.
//         const buffer = readFileSync(path);

//         // Read the chunk data from the file.
//         const resultant = Chunk.deserialize(
//           dimension.type,
//           chunk.x,
//           chunk.z,
//           buffer
//         );

//         // Set the chunk as ready.
//         chunk.ready = true;

//         // Add the chunk to the dimension's chunk map.
//         chunks.set(chunk.hash, chunk.insert(resultant));

//         // Read the blocks from the chunk.
//         const blocks = this.readChunkBlocks(chunk, dimension);

//         // Check if there are any blocks in the chunk.
//         if (blocks.length > 0) {
//           // Iterate through the blocks and add them to the chunk.
//           for (const storage of blocks) {
//             // Create a new block instance of the block permutation.
//             const block = new Block(dimension, storage.getPosition());

//             // Hash the block position to use as a key.
//             const hash = BlockPosition.hash(block.position);

//             // Add the block to the dimension blocks collection.
//             dimension.blocks.set(hash, block);
//           }
//         }

//         // Return the chunk.
//         return chunk;
//       } else {
//         // Generate a new chunk if the file does not exist.
//         const resultant = await dimension.generator.apply(chunk.x, chunk.z);

//         // Add the chunk to the dimension's chunk map.
//         chunks.set(chunk.hash, chunk.insert(resultant));

//         // Check if the chunk is ready.
//         if (chunk.ready) new ChunkReadySignal(dimension, chunk).emit();

//         // Return the chunk.
//         return chunk;
//       }
//     }
//   }

//   public async writeChunk(chunk: Chunk, dimension: Dimension): Promise<void> {
//     // Get the entities that are in the chunk.
//     const entities = dimension
//       .getEntities({ chunk })
//       .filter((entity) => !entity.isPlayer()) // Remove players from the entities list.
//       .map((entity) => entity.getStorage()); // Map the entities to their level storage.

//     // Write the chunk entities to the database.
//     this.writeChunkEntities(chunk, dimension, entities);

//     // Get the blocks that are in the chunk.
//     const blocks = [...dimension.blocks]
//       .filter(([, block]) => {
//         // Convert the block position to chunk coordinates.
//         const cx = block.position.x >> 4;
//         const cz = block.position.z >> 4;

//         // Check if the block is in the chunk.
//         if (cx !== chunk.x || cz !== chunk.z) return false;

//         // Return true if the block is in the chunk.
//         return true;
//       })
//       .map(([, block]) => block.getStorage()); // Map the blocks to their level storage.

//     // Write the block list to the database.
//     this.writeChunkBlocks(chunk, dimension, blocks);

//     // Check if the chunk is empty or dirty.
//     if (chunk.isEmpty() || !chunk.dirty) return;

//     // Get the path for the chunk file.
//     const path = resolve(
//       this.path,
//       "dimensions",
//       dimension.identifier,
//       "chunks",
//       `${chunk.x}.${chunk.z}.dat`
//     );

//     // Serialize the chunk data to a buffer.
//     const buffer = Chunk.serialize(chunk);

//     // Write the chunk data to the file.
//     writeFileSync(path, buffer);
//   }

//   public readPlayer(uuid: string): PlayerLevelStorage | null {
//     // Check if the player directory exists.
//     if (!existsSync(resolve(this.path, "players")))
//       // Create the players directory if it does not exist.
//       mkdirSync(resolve(this.path, "players"));

//     // Get the path for the player data.
//     const playerPath = resolve(this.path, "players", `${uuid}.nbt`);

//     // Check if the player data file exists.
//     if (!existsSync(playerPath)) return null;

//     throw new Error("Ignore");

//     // Read the player data from the file.
//     // return PlayerLevelStorage.fromBuffer(readFileSync(playerPath));
//   }

//   // public writePlayer(player: PlayerLevelStorage): void {
//   //   // Check if the player directory exists.
//   //   if (!existsSync(resolve(this.path, "players")))
//   //     // Create the players directory if it does not exist.
//   //     mkdirSync(resolve(this.path, "players"));

//   //   // Get the path for the player data.
//   //   const playerPath = resolve(this.path, "players", `${player.getUuid()}.nbt`);

//   //   // Write the player data to the file.
//   //   // writeFileSync(playerPath, PlayerLevelStorage.toBuffer(player));
//   // }

//   public readChunkEntities(
//     chunk: Chunk,
//     dimension: Dimension
//   ): Array<EntityLevelStorage> {
//     // Read the entities from the chunk entities directory.
//     const entitiesPath = resolve(
//       this.path,
//       "dimensions",
//       dimension.identifier,
//       "entities",
//       `${chunk.x}.${chunk.z}.nbt`
//     );

//     // Check if the entities file exists.
//     if (!existsSync(entitiesPath)) return [];

//     // Read the entities from the file.
//     const buffer = readFileSync(entitiesPath);
//     const stream = new BinaryStream(buffer);

//     // Read the root compound tag from the stream.
//     const root = CompoundTag.read(stream);

//     // Read the entities from the stream.
//     const entities = [...root.get<ListTag<CompoundTag>>("entities")!.values()];

//     // Map the entities to EntityLevelStorage instances.
//     return [];
//   }

//   public writeChunkEntities(
//     chunk: Chunk,
//     dimension: Dimension,
//     entities: Array<EntityLevelStorage>
//   ): void {
//     // Get the path for the chunk entities file.
//     const entitiesPath = resolve(
//       this.path,
//       "dimensions",
//       dimension.identifier,
//       "entities",
//       `${chunk.x}.${chunk.z}.nbt`
//     );

//     // Check if there are no entities to write.
//     if (entities.length === 0 && !existsSync(entitiesPath)) return;
//     else if (entities.length === 0 && existsSync(entitiesPath)) {
//       // Delete the entities file if it exists and there are no entities.
//       rmSync(entitiesPath, { force: true });
//     } else {
//       // Create a new list tag for the entities.
//       const list = new ListTag<CompoundTag>(entities);

//       // Create a new binary stream to write the entities.
//       const stream = new BinaryStream();

//       // Create a new compound tag to hold the entities.
//       const root = new CompoundTag();

//       // Add the entities list to the root compound tag.
//       root.set("entities", list);

//       // Write the root compound tag to the stream.
//       CompoundTag.write(stream, root);

//       // Write the entities to the file.
//       writeFileSync(entitiesPath, stream.getBuffer());
//     }
//   }

//   public readChunkBlocks(
//     chunk: Chunk,
//     dimension: Dimension
//   ): Array<BlockLevelStorage> {
//     // Get the path for the chunk blocks file.
//     const blocksPath = resolve(
//       this.path,
//       "dimensions",
//       dimension.identifier,
//       "blocks",
//       `${chunk.x}.${chunk.z}.nbt`
//     );

//     // Check if the blocks file exists.
//     if (!existsSync(blocksPath)) return [];

//     // Read the blocks from the file.
//     const buffer = readFileSync(blocksPath);
//     const stream = new BinaryStream(buffer);

//     // Read the root compound tag from the stream.
//     const root = CompoundTag.read(stream);

//     // Read the blocks from the stream.
//     const blocks = [...root.get<ListTag<CompoundTag>>("blocks")!.values()];

//     // Map the blocks to BlockLevelStorage instances.
//     return blocks.map((block) => new BlockLevelStorage(chunk, block));
//   }

//   public writeChunkBlocks(
//     chunk: Chunk,
//     dimension: Dimension,
//     blocks: Array<BlockLevelStorage>
//   ): void {
//     // Get the path for the chunk blocks file.
//     const blocksPath = resolve(
//       this.path,
//       "dimensions",
//       dimension.identifier,
//       "blocks",
//       `${chunk.x}.${chunk.z}.nbt`
//     );

//     // Check if there are no blocks to write.
//     if (blocks.length === 0 && !existsSync(blocksPath)) return;
//     else if (blocks.length === 0 && existsSync(blocksPath)) {
//       // Delete the blocks file if it exists and there are no blocks.
//       rmSync(blocksPath, { force: true });
//     } else {
//       // Create a new list tag for the blocks.
//       const list = new ListTag<CompoundTag>(blocks);

//       // Create a new binary stream to write the blocks.
//       const stream = new BinaryStream();

//       // Create a new compound tag to hold the blocks.
//       const root = new CompoundTag();

//       // Add the blocks list to the root compound tag.
//       root.set("blocks", list);

//       // Write the root compound tag to the stream.
//       CompoundTag.write(stream, root);

//       // Write the blocks to the file.
//       writeFileSync(blocksPath, stream.getBuffer());
//     }
//   }

//   public static async initialize(
//     serenity: Serenity,
//     properties: WorldProviderProperties
//   ): Promise<void> {
//     // Resolve the path for the worlds directory.
//     const path = resolve(properties.path);

//     // Check if the path provided exists.
//     // If it does not exist, create the directory.
//     if (!existsSync(path)) mkdirSync(path);

//     // Read all the directories in the world directory.
//     // Excluding file types, as a world entry is a directory.
//     const directories = readdirSync(path, { withFileTypes: true }).filter(
//       (dirent) => dirent.isDirectory()
//     );

//     // Check if the directory is empty.
//     // If it is, create a new world with the default identifier.
//     if (directories.length === 0) {
//       serenity.registerWorld(
//         await this.create(serenity, properties, { identifier: "default" })
//       );

//       return;
//     }

//     // Iterate through all the directories in the world directory.
//     for (const directory of directories) {
//       // Get the path for the world.
//       const worldPath = resolve(path, directory.name);

//       // Get the world properties.
//       let properties: Partial<WorldProperties> = { identifier: directory.name };
//       if (existsSync(resolve(worldPath, "properties.json"))) {
//         // Read the properties of the world.
//         properties = JSON.parse(
//           readFileSync(resolve(worldPath, "properties.json"), "utf-8")
//         );
//       }

//       // Check if the world directory contains a dimensions directory.
//       if (!existsSync(resolve(worldPath, "dimensions")))
//         // Create the dimensions directory if it does not exist.
//         mkdirSync(resolve(worldPath, "dimensions"));

//       // Check if the world directory contains a players directory.
//       if (!existsSync(resolve(worldPath, "players")))
//         // Create the players directory if it does not exist.
//         mkdirSync(resolve(worldPath, "players"));

//       // Check if the world directory contains a structures directory.
//       if (!existsSync(resolve(worldPath, "structures")))
//         // Create the structures directory if it does not exist.
//         mkdirSync(resolve(worldPath, "structures"));

//       // Create a new world instance.
//       const world = new World(serenity, new this(worldPath), properties);

//       // Iterate through all the dimensions in the world directory.
//       for (const [identifier] of world.dimensions) {
//         const dimensionPath = resolve(worldPath, "dimensions", identifier);

//         // Check if the dimension directory exists.
//         if (!existsSync(dimensionPath))
//           // Create the dimension directory if it does not exist.
//           mkdirSync(dimensionPath);

//         // Check if the dimension directory contains a chunks directory.
//         if (!existsSync(resolve(dimensionPath, "chunks")))
//           // Create the chunks directory if it does not exist.
//           mkdirSync(resolve(dimensionPath, "chunks"));

//         // Check if the dimension directory contains an entities directory.
//         if (!existsSync(resolve(dimensionPath, "entities")))
//           // Create the entities directory if it does not exist.
//           mkdirSync(resolve(dimensionPath, "entities"));

//         // Check if the dimension directory contains a blocks directory.
//         if (!existsSync(resolve(dimensionPath, "blocks")))
//           // Create the blocks directory if it does not exist.
//           mkdirSync(resolve(dimensionPath, "blocks"));
//       }

//       // Create a new WorldInitializedSignal instance.
//       new WorldInitializeSignal(world).emit();

//       // Write the properties to the world.
//       writeFileSync(
//         resolve(worldPath, "properties.json"),
//         JSON.stringify(world.properties, null, 2)
//       );

//       // Read all the structures in the world directory.
//       const files = readdirSync(resolve(worldPath, "structures"), {
//         withFileTypes: true
//       }).filter(
//         // Filter only files that end with .mcstructure.
//         (dirent) => dirent.isFile() && dirent.name.endsWith(".mcstructure")
//       );

//       // Attempt to read the structures from the world directory.
//       for (const file of files) {
//         try {
//           // Create the structure from the file.
//           const path = resolve(worldPath, "structures", file.name);

//           // Read the structure file.
//           const stream = new BinaryStream(readFileSync(path));

//           // Create a new structure instance from the file.
//           const structure = Structure.from(world, CompoundTag.read(stream));

//           // Parse the identifier from the file name.
//           const identifier = file.name.replace(/\.mcstructure$/, "");

//           // Add the structure to the world.
//           world.structures.set(identifier, structure);

//           // Log a debug message indicating the structure was loaded.
//           world.logger.debug(
//             `Loaded structure "${identifier}" from file "${file.name}" for world "${world.properties.identifier}."`
//           );
//         } catch (reason) {
//           // Log the error if the structure failed to load.
//           world.logger.error(
//             `Failed to load structure from file ${file.name} for world ${world.properties.identifier}. Reason:`,
//             reason
//           );
//         }
//       }

//       // Register the world with the serenity instance.
//       serenity.registerWorld(world);
//     }
//   }

//   public static async create(
//     serenity: Serenity,
//     properties: WorldProviderProperties,
//     worldProperties?: Partial<WorldProperties>
//   ): Promise<World> {
//     // Resolve the path for the worlds directory.
//     const path = resolve(properties.path);

//     // Check if the path provided exists.
//     // If it does not exist, create the directory.
//     if (!existsSync(path)) mkdirSync(path);

//     // Check if a world identifier was provided.
//     if (!worldProperties?.identifier)
//       throw new Error("A world identifier is required to create a new world.");

//     // Get the world path from the properties.
//     const worldPath = resolve(path, worldProperties.identifier);

//     // Check if the world already exists.
//     if (existsSync(worldPath))
//       throw new Error(
//         `World with identifier ${worldProperties.identifier} already exists in the directory.`
//       );

//     // Create the world directory.
//     mkdirSync(worldPath);

//     // Check if the world directory contains a dimensions directory.
//     if (!existsSync(resolve(worldPath, "dimensions")))
//       // Create the dimensions directory if it does not exist.
//       mkdirSync(resolve(worldPath, "dimensions"));

//     // Check if the world directory contains a players directory.
//     if (!existsSync(resolve(worldPath, "players")))
//       // Create the players directory if it does not exist.
//       mkdirSync(resolve(worldPath, "players"));

//     // Check if the world directory contains a structures directory.
//     if (!existsSync(resolve(worldPath, "structures")))
//       // Create the structures directory if it does not exist.
//       mkdirSync(resolve(worldPath, "structures"));

//     // Create a new world instance.
//     const world = new World(serenity, new this(worldPath), worldProperties);

//     // Assign the world to the provider.
//     world.provider.world = world;

//     // Iterate through all the dimensions in the world directory.
//     for (const [identifier] of world.dimensions) {
//       const dimensionPath = resolve(worldPath, "dimensions", identifier);

//       // Check if the dimension directory exists.
//       if (!existsSync(dimensionPath))
//         // Create the dimension directory if it does not exist.
//         mkdirSync(dimensionPath);

//       // Check if the dimension directory contains a chunks directory.
//       if (!existsSync(resolve(dimensionPath, "chunks")))
//         // Create the chunks directory if it does not exist.
//         mkdirSync(resolve(dimensionPath, "chunks"));

//       // Check if the dimension directory contains an entities directory.
//       if (!existsSync(resolve(dimensionPath, "entities")))
//         // Create the entities directory if it does not exist.
//         mkdirSync(resolve(dimensionPath, "entities"));

//       // Check if the dimension directory contains a blocks directory.
//       if (!existsSync(resolve(dimensionPath, "blocks")))
//         // Create the blocks directory if it does not exist.
//         mkdirSync(resolve(dimensionPath, "blocks"));
//     }

//     // Create a new WorldInitializedSignal instance.
//     new WorldInitializeSignal(world).emit();

//     // Create the properties file for the world.
//     writeFileSync(
//       resolve(worldPath, "properties.json"),
//       JSON.stringify(world.properties, null, 2)
//     );

//     // Return the created world instance.
//     return world;
//   }
// }

// export { FileSystemProvider };
