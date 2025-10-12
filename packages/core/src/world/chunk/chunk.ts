import {
  BlockPosition,
  ChunkCoords,
  DimensionType,
  type IPosition
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { BlockIdentifier } from "../../enums";
import { BlockLevelStorage, BlockPermutation } from "../../block";
import { BiomeType } from "../../biome";

import { SubChunk } from "./sub-chunk";
import { BiomeStorage } from "./biome-storage";

/**
 * Represents a chunk within a Dimension instance. Chunks hold sub chunks, which hold block states (BlockPermutations). Chunks can be dirty, meaning they have been modified and need to be saved.
 *
 * **Example Usage**
 * ```typescript
 	import { BlockIdentifier, BlockPermutation } from "@serenityjs/block"
	import { DimensionType } from "@serenityjs/protocol"
	import { Chunk } from "@serenityjs/world"

	// Create a new chunk with the dimension type "Overworld" and the x and z coordinates of 0
	const chunk = new Chunk(DimensionType.Overworld, 0, 0) // DimensionType will determine the maximum height of the chunk

	// First we need to obtain the BlockPermutations we will use to set the blocks
	const bedrock = BlockPermutation.resolve(BlockIdentifier.Bedrock)
	const dirt = BlockPermutation.resolve(BlockIdentifier.Dirt, { dirt_type: "normal" })
	const grass = BlockPermutation.resolve(BlockIdentifier.GrassBlock)

	// We can now set a block at the x, y, and z coordinates of the chunk
	// We will create a Superflat chunk with a maximum height of 4
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			for (let y = 0; y < 4; y++) {
				// Check if the y coordinate is 0, if so, set the block to bedrock
				if (y === 0) chunk.setPermutation(x, y, z, bedrock)

				// Check if the y coordinate is 1 and 2, if so, set the block to dirt
				else if (y === 1 || y === 2) chunk.setPermutation(x, y, z, dirt)

				// Check if the y coordinate is 3, if so, set the block to grass
				else if (y === 3) chunk.setPermutation(x, y, z, grass)
			}
		}
	}
 * ```
 */
export class Chunk {
  /**
   * The maximum amount of sub chunks.
   */
  public static readonly MAX_SUB_CHUNKS = 24;

  /**
   * The block level storage of the chunk, mapped by their position hash.
   */
  private readonly blocks: Map<bigint, BlockLevelStorage> = new Map();

  /**
   * The entity level storage of the chunk, mapped by their unique id.
   */
  private readonly entities: Map<bigint, CompoundTag> = new Map();

  /**
   * The dimension type of the chunk.
   */
  public readonly type: DimensionType;

  /**
   * The X coordinate of the chunk.
   */
  public readonly x: number;

  /**
   * The Z coordinate of the chunk.
   */
  public readonly z: number;

  /**
   * The hash key of the chunk.
   */
  public readonly hash: bigint;

  /**
   * The sub chunks of the chunk.
   */
  public readonly subchunks: Array<SubChunk>;

  /**
   * A cached buffer of the serialized chunk.
   */
  public cache: Buffer | null = null;

  /**
   * If the chunk has been modified, and has not been saved.
   */
  public dirty = false;

  /**
   * Creates a new chunk.
   *
   * @param type The dimension type of the chunk.
   * @param x The X coordinate of the chunk.
   * @param z The Z coordinate of the chunk.
   * @param subchunks The sub chunks of the chunk.
   */
  public constructor(
    x: number,
    z: number,
    type: DimensionType,
    subchunks?: Array<SubChunk>
  ) {
    this.x = x;
    this.z = z;
    this.type = type;
    this.hash = ChunkCoords.hash({ x, z });
    this.subchunks = subchunks ?? new Array<SubChunk>(Chunk.MAX_SUB_CHUNKS);
  }

  /**
   * Get the permutation at the given X, Y and Z coordinates.
   * @param position The position.
   * @param layer The state layer.
   */
  public getPermutation(position: IPosition, layer = 0): BlockPermutation {
    // Correct the Y level for the overworld.
    const { x, y, z } = position;

    // Get the sub chunk.
    const subchunk = this.getSubChunk(y >> 4);

    // Get the block state.
    const state = subchunk.getState(x & 0xf, y & 0xf, z & 0xf, layer); // 0 = Solids, 1 = Liquids or Logged

    // Return the permutation.
    return BlockPermutation.permutations.get(state) as BlockPermutation;
  }

  /**
   * Set the permutation at the given X, Y and Z coordinates.
   * @param position The position.
   * @param layer The state layer.
   * @param permutation The permutation.
   */
  public setPermutation(
    position: IPosition,
    permutation: BlockPermutation,
    layer = 0,
    dirty = true
  ): void {
    // Get the x, y and z coordinates from the position.
    const { x, y, z } = position;

    // Get the sub chunk.
    const subchunk = this.getSubChunk(y >> 4);

    // Get the block state.
    const state = permutation.networkId;

    // Set the block.
    subchunk.setState(x & 0xf, y & 0xf, z & 0xf, state, layer); // 0 = Solids, 1 = Liquids or Logged

    // Set the chunk as dirty.
    if (dirty) this.dirty = true;

    // Set the cache as null.
    this.cache = null;
  }

  /**
   * Get the biome at the given position.
   * @param position The block position to get the biome at.
   * @returns The biome at the given block position.
   */
  public getBiome(position: IPosition): BiomeType {
    // Get the x, y and z coordinates from the position.
    const { x, y, z } = position;

    // Get the sub chunk.
    const subchunk = this.getSubChunk(y >> 4);

    // Fetch the biome from the biome storage.
    const biomeId = subchunk.getBiome(x & 0xf, y & 0xf, z & 0xf);

    // Return the biome type.
    return BiomeType.types.get(biomeId) || BiomeType.types.get(0)!;
  }

  /**
   * Set the biome at the given position.
   * @param position The block position to set the biome at.
   * @param biome The biome type to set at the given block position.
   * @param dirty If the chunk should be marked as dirty. Default is true.
   */
  public setBiome(position: IPosition, biome: BiomeType, dirty = true): void {
    // Get the x, y and z coordinates from the position.
    const { x, y, z } = position;

    // Get the sub chunk.
    const subchunk = this.getSubChunk(y >> 4);

    // Set the biome in the biome storage.
    subchunk.setBiome(x & 0xf, y & 0xf, z & 0xf, biome.networkId);

    // Set the chunk as dirty.
    if (dirty) this.dirty = true;

    // Set the cache as null.
    this.cache = null;
  }

  /**
   * Get the topmost level in which a permutation is not air, at the given X and Z coordinates.
   * @param position The position to query.
   * @returns The topmost level in which a permutation is not air.
   */
  public getTopmostLevel(position: IPosition): number {
    // Get the Y level.
    for (let y = position.y; y >= -64; y--) {
      // Get the permutation at the position.
      const permutation = this.getPermutation({ ...position, y });

      // Check if the permutation is air or is not solid.
      if (permutation.type.identifier === BlockIdentifier.Air) continue;
      if (!permutation.type.solid) continue;

      // Return the Y level.
      return y;
    }

    // Return 0 if no block was found.
    return -64;
  }

  /**
   * Get the bottommost level in which a permutation is not air, at the given X and Z coordinates.
   * @param position The position to query.
   * @returns The bottommost level in which a permutation is not air.
   */
  public getBottommostLevel(position: IPosition): number {
    // Get the Y level.
    for (let y = 0; y <= position.y; y++) {
      const permutation = this.getPermutation({ ...position, y });
      if (permutation.type.identifier !== BlockIdentifier.Air) return y;
    }

    // Return 0 if no block was found.
    return 0;
  }

  /**
   * Get the sub chunk at the given index.
   * @param index The index.
   */
  public getSubChunk(index: number): SubChunk {
    // Prepare an index offset.
    // This is used to adjust the index for the overworld dimension.
    let offset = 0;

    // Check if the dimension type is overworld.
    if (this.type === DimensionType.Overworld) offset = 4; // Adjust index for overworld

    // Check if the index is out of bounds.
    if (index + offset < 0) {
      // Set the index to 0 & reset the offset.
      index = offset = 0;
    } else if (index + offset >= Chunk.MAX_SUB_CHUNKS) {
      // Set the index to the maximum sub chunks & reset the offset.
      index = Chunk.MAX_SUB_CHUNKS - 1;
      offset = 0;
    }

    // Check if the sub chunk exists.
    if (!this.subchunks[index + offset]) {
      // Iterate until the sub chunk exists.
      for (let i = 0; i <= index + offset; i++) {
        // Check if the sub chunk already exists.
        if (this.subchunks[i]) continue;

        // Create a new sub chunk.
        const subchunk = new SubChunk();
        subchunk.index = i - offset;

        // Set the sub chunk.
        this.subchunks[i] = subchunk;

        // Check if the current index is the one we are looking for.
        if (i === index + offset) {
          // Return the sub chunk.
          return subchunk;
        }
      }
    }

    // Return the sub chunk.
    return this.subchunks[index + offset] as SubChunk;
  }

  /**
   * Get the amount of sub chunks that need to be sent.
   */
  public getSubChunkSendCount(): number {
    // Loop through each sub chunk.
    let count = 0;
    for (let index = Chunk.MAX_SUB_CHUNKS - 1; index >= 0; index--) {
      // Get the sub chunk.
      const subchunk = this.subchunks[index];

      // Check if the sub chunk exists.
      if (!subchunk || subchunk.isEmpty()) count++;
      // Break if the sub chunk is not empty, as all sub chunks after this will not be empty.
      else break;
    }

    // Return the count.
    return Chunk.MAX_SUB_CHUNKS - count;
  }

  /**
   * Get all the block storage of the chunk.
   * @returns An array of all the block storage compound tags.
   */
  public getAllBlockStorages(): Array<BlockLevelStorage> {
    return Array.from(this.blocks.values());
  }

  /**
   * Check if the chunk has block storage at the given position.
   * @param position The position to check for block storage.
   * @returns True if the chunk has block storage at the given position, false otherwise.
   */
  public hasBlockStorage(position: IPosition): boolean {
    // Convert the position to a bigint key.
    const key = BlockPosition.hash(BlockPosition.from(position));

    // Return if the block storage exists.
    return this.blocks.has(key);
  }

  /**
   * Get the block storage at the given position.
   * @param position The position to get the block storage at.
   * @returns The block storage compound tag, or null if none exists.
   */
  public getBlockStorage(position: IPosition): BlockLevelStorage | null {
    // Convert the position to a bigint key.
    const key = BlockPosition.hash(BlockPosition.from(position));

    // Return the block storage.
    return this.blocks.get(key) || null;
  }

  /**
   * Set the block storage at the given block position.
   * @param position The block position to set the block storage at.
   * @param data The block storage compound tag, or null to delete the block storage.
   * @param dirty If the chunk should be marked as dirty. Default is true.
   */
  public setBlockStorage(
    position: IPosition,
    data: BlockLevelStorage | null,
    dirty = true
  ): void {
    // Convert the position to a bigint key.
    const key = BlockPosition.hash(BlockPosition.from(position));

    // Check if data is given.
    if (data) {
      // Set the position of the data.
      data.setPosition(BlockPosition.from(position));

      // Set the block storage in the map.
      this.blocks.set(key, data);
    }
    // If no data is given, delete the block data.
    else this.blocks.delete(key);

    // Set the chunk as dirty.
    if (dirty) this.dirty = true;
  }

  public getAllEntityStorages(): Array<[bigint, CompoundTag]> {
    return Array.from(this.entities.entries());
  }

  public hasEntityStorage(uniqueId: bigint): boolean {
    return this.entities.has(uniqueId);
  }

  public getEntityStorage(uniqueId: bigint): CompoundTag | null {
    return this.entities.get(uniqueId) || null;
  }

  public setEntityStorage(
    uniqueId: bigint,
    data: CompoundTag | null,
    dirty = true
  ): void {
    // If data is given, set the entity storage in the map.
    if (data) this.entities.set(uniqueId, data);
    // If no data is given, delete the entity data.
    else this.entities.delete(uniqueId);

    // Set the chunk as dirty.
    if (dirty) this.dirty = true;
  }

  /**
   * Check if the chunk is empty.
   */
  public isEmpty(): boolean {
    // Loop through each sub chunk.
    for (const subchunk of this.subchunks) {
      // Check if the sub chunk is empty.
      if (!subchunk || !subchunk.isEmpty()) {
        // The chunk is not empty.
        return false;
      }
    }

    // The chunk is empty.
    return true;
  }

  /**
   * Insert a chunk into the current chunk.
   * @param source The chunk to insert.
   * @returns The current chunk with the updated sub chunks.
   */
  public insert(source: Chunk): Chunk {
    // Check if the specified chunk coordinates are the same.
    if (this.x !== source.x || this.z !== source.z)
      // Throw an error if not the case.
      throw new Error("Cannot assign chunk with different coordinates.");

    // Copy over the subchunks of the source chunk.
    for (let i = 0; i < source.subchunks.length; i++) {
      // Check if the sub chunk exists in the source chunk.
      if (!source.subchunks[i]) continue;

      // Copy over the sub chunk if it exists.
      this.subchunks[i] = source.subchunks[i] as SubChunk;
    }

    // Copy over the chunk flags & cache.
    this.dirty = source.dirty;
    this.cache = source.cache;

    // Return the target chunk.
    return this;
  }

  /**
   * Serialize the chunk into a buffer.
   * @param chunk The chunk to serialize.
   * @param nbt If block palette should be serialized as NBT.
   * @returns The serialized buffer.
   */
  public static serialize(chunk: Chunk, nbt = false): Buffer {
    // Check if the chunk has a cache.
    if (chunk.cache) return chunk.cache;

    // Create a new stream.
    const stream = new BinaryStream();

    const subChunkCount = chunk.getSubChunkSendCount();

    // Serialize each sub chunk.
    for (let index = 0; index < subChunkCount; index++) {
      // Prepare an index offset.
      let offset = 0;

      // Check if the dimension type is overworld.
      if (chunk.type === DimensionType.Overworld) offset = 4; // Adjust index for overworld

      // Get the sub chunk.
      const subchunk = chunk.subchunks[index];

      // Check if the sub chunk exists.
      if (subchunk) {
        // Serialize the sub chunk.
        SubChunk.serialize(subchunk, stream, nbt);
      } else {
        // Create an empty sub chunk.
        const subchunk = new SubChunk();
        subchunk.index = index - offset;

        // Serialize an empty sub chunk.
        SubChunk.serialize(subchunk, stream, nbt);
      }
    }

    // Iterate through each sub chunk and serialize the biomes.
    for (let index = 0; index < subChunkCount; index++) {
      // Get the sub chunk.
      const subchunk = chunk.subchunks[index];

      // Check if the sub chunk exists.
      if (!subchunk || subchunk.isEmpty()) continue;

      // Serialize the biomes.
      BiomeStorage.serialize(subchunk.biomes, stream);
    }

    // Border blocks?
    stream.writeUint8(0);

    // Set the cache of the chunk.
    chunk.cache = stream.getBuffer();

    // Return the buffer.
    return chunk.cache;
  }

  /**
   * Deserialize a buffer into a chunk.
   * @param type The dimension type of the chunk.
   * @param x The X coordinate of the chunk.
   * @param z The Z coordinate of the chunk.
   * @param buffer The buffer to deserialize.
   * @param nbt If block palette should be deserialized as NBT.
   * @returns The deserialized chunk.
   */
  public static deserialize(
    type: DimensionType,
    x: number,
    z: number,
    buffer: Buffer,
    nbt = false
  ): Chunk {
    // Create a new stream.
    const stream = new BinaryStream(buffer);

    // Deserialize each sub chunk.
    const subchunks = new Array<SubChunk>(Chunk.MAX_SUB_CHUNKS);

    // Loop through each sub chunk.
    for (let index = 0; index < Chunk.MAX_SUB_CHUNKS; ++index) {
      const header = stream.buffer[stream.offset];

      if (header !== 8 && header !== 9) break;
      subchunks[index] = SubChunk.deserialize(stream, nbt);
    }

    // Iterate through each sub chunk and deserialize the biomes.
    for (const subchunk of subchunks) {
      // Check if the sub chunk exists.
      if (!subchunk || subchunk.isEmpty()) continue;

      // Deserialize the biomes.
      subchunk.biomes = BiomeStorage.deserialize(stream);
    }

    // Border blocks?
    stream.readUint8();

    // Create a new chunk.
    const chunk = new Chunk(x, z, type, subchunks);

    // Set the cache of the chunk.
    chunk.cache = buffer;

    // Return the chunk.
    return chunk;
  }
}
