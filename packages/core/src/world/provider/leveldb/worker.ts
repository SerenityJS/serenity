import { resolve } from "node:path";

import { Leveldb } from "@serenityjs/leveldb";
import { ChunkCoords, DimensionType } from "@serenityjs/protocol";

import { Chunk, SubChunk } from "../../chunk";
import { ProviderWorker, Worker } from "../../worker";
import { BlockPermutation } from "../../..";

import { LevelDBProvider } from "./leveldb2";
import { LevelDBKeyBuilder } from "./key-builder";

@Worker(LevelDBProvider)
class LevelDBProviderWorker extends ProviderWorker {
  public static path = __filename;

  /**
   * The database instance for the worker.
   */
  public readonly db!: Leveldb;

  public constructor(parent: typeof LevelDBProvider, properties: [string]) {
    super(parent, properties);

    // Get the path to the database
    const dbPath = resolve(properties[0], "db");

    // Open the LevelDB database
    this.db = Leveldb.open(dbPath);
  }

  public onShutdown(): void {
    // Close the LevelDB database
    this.db.close();
  }

  public async readChunk(
    cx: number,
    cz: number,
    type: DimensionType,
    dimension: number
  ): Promise<Chunk | null> {
    if (this.hasChunk(cx, cz, dimension)) {
      // Create a new chunk instance.
      const chunk = new Chunk(type, cx, cz);

      // Iterate through the subchunks of the chunk.
      for (let i = 0; i < Chunk.MAX_SUB_CHUNKS; i++) {
        // Prepare an offset variable.
        // This is used to adjust the index for overworld dimensions.
        let offset = 0;

        // Check if the dimension type is overworld.
        if (type === DimensionType.Overworld) offset = 4; // Adjust index for overworld

        // Calculate the subchunk Y coordinate.
        const cy = i - offset;

        // Attempt to read the subchunk from the database.
        try {
          console.log(
            `Reading subchunk at (${cx}, ${cy}, ${cz}) in dimension ${dimension}`
          );

          // Read the subchunk from the database.
          const subchunk = this.readSubChunk(cx, cy, cz, dimension);

          // Check if the subchunk is empty.
          if (subchunk.isEmpty()) continue;

          // Push the subchunk to the chunk.
          chunk.subchunks[i] = subchunk;
        } catch {
          // We can ignore any error that occurs while reading the subchunk.
          continue;
        }
      }

      // // Read the biomes from the chunk.
      // const biomes = this.readChunkBiomes(chunk, dimension);

      // // Iterate through the biomes and add them to the chunk.
      // for (let i = 0; i < biomes.length; i++) {
      //   // Get the corresponding subchunk and biome.
      //   const subchunk = chunk.subchunks[i];
      //   const biome = biomes[i];

      //   // Check if the subchunk and biome exist.
      //   if (!subchunk || !biome) continue;

      //   // Set the biome storage of the subchunk.
      //   subchunk.biomes = biome;
      // }

      // // Read the entities from the database.
      // const entities = this.readChunkEntities(chunk, dimension);

      // // Check if there are any entities in the chunk.
      // if (entities.length > 0) {
      //   // Iterate through the entities and add them to the chunk.
      //   for (const storage of entities) {
      //     // Get the unique id of the entity.
      //     const uniqueId = storage.get<LongTag>("UniqueID");

      //     // Skip if the unique id does not exist.
      //     if (!uniqueId) continue;

      //     // Set the entity storage in the chunk.
      //     chunk.setEntityStorage(BigInt(uniqueId.valueOf()), storage, false);
      //   }
      // }

      // // Read the blocks from the chunk.
      // const blocks = this.readChunkBlocks(chunk, dimension);

      // // Check if there are any blocks in the chunk.
      // if (blocks.length > 0) {
      //   // Iterate through the blocks and add them to the chunk.
      //   for (const storage of blocks) {
      //     // Set the block storage in the chunk.
      //     chunk.setBlockStorage(storage.getPosition(), storage, false);
      //   }
      // }

      // Return the chunk.
      return chunk;
    }

    // Return null if the chunk does not exist.
    return null;
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
    dimension: number
  ): SubChunk {
    // Build the subchunk key for the database.
    const key = LevelDBKeyBuilder.buildSubChunkKey(cx, cy, cz, dimension);

    // Read the subchunk buffer from the database.
    const buffer = this.db.get(key);

    // Deserialize the subchunk from the database.
    const subchunk = SubChunk.from(buffer, true);

    // Set the chunk y coordinate of the subchunk.
    subchunk.index = cy;

    // Return the subchunk from the database.
    return subchunk;
  }

  /**
   * Checks if the database has a chunk.
   * @param cx The chunk X coordinate.
   * @param cz The chunk Z coordinate.
   * @param dimension The dimension to check for the chunk.
   */
  public hasChunk(cx: number, cz: number, dimension: number): boolean {
    try {
      // Create a key for the chunk version.
      const key = LevelDBKeyBuilder.buildChunkVersionKey(cx, cz, dimension);

      // Check if the key exists in the database.
      const data = this.db.get(key);
      if (data) return true;

      // Return false if the chunk does not exist.
      return false;
    } catch {
      return false;
    }
  }
}

export { LevelDBProviderWorker };
