import { Endianness, type BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag } from "@serenityjs/nbt";

import { BlockIdentifier } from "../../enums";
import { BlockPermutation } from "../../block";

// TODO: Add logged blocks, light blocks, and biomes.

/**
 * Represents a block storage.
 */
class BlockStorage {
  /**
   * The maximum chunk size in the x direction.
   */
  public static readonly MAX_X = 16;

  /**
   * The maximum chunk size in the y direction.
   */
  public static readonly MAX_Y = 16;

  /**
   * The maximum chunk size in the z direction.
   */
  public static readonly MAX_Z = 16;

  /**
   * The total maximum chunk size.
   */
  public static readonly MAX_SIZE = 16 * 16 * 16;

  /**
   * The palette of the storage.
   */
  public readonly palette: Array<number>;

  /**
   * The blocks of the storage.
   */
  public readonly blocks: Array<number>;

  /**
   * The air value of the storage.
   */
  public readonly air: number;

  /**
   * Creates a new block storage.
   *
   * @param blocks The optional blocks.
   * @param palette The optional palette.
   */
  public constructor(palette?: Array<number>, blocks?: Array<number>) {
    // Find the air value.
    const permutation = BlockPermutation.resolve(BlockIdentifier.Air);
    this.air = permutation.network;

    // Assign the palette.
    // When we create chunks, we will provide the palette with the current air value.
    this.palette = palette ?? [this.air];

    // Create the block storage.
    this.blocks =
      blocks ?? Array.from({ length: BlockStorage.MAX_SIZE }, () => 0);
  }

  /**
   * Checks if the block storage is empty.
   */
  public isEmpty(): boolean {
    return this.palette.length === 1 && this.palette[0] === this.air;
  }

  /**
   * Gets the block state at the given coordinates.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @returns The block state.
   */
  public getState(bx: number, by: number, bz: number): number {
    // Calculate the index.
    const index = BlockStorage.getIndex(bx, by, bz);

    // Get the palette index.
    const paletteIndex = this.blocks[index] ?? 0;

    // Return the block.
    return this.palette[paletteIndex] ?? this.air;
  }

  /**
   * Sets the block state at the given coordinates.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @param state The block state.
   */
  public setState(bx: number, by: number, bz: number, state: number): void {
    // Check if the state exists in the palette.
    let paletteIndex = this.palette.indexOf(state);
    if (paletteIndex === -1) {
      // Add the state to the palette.
      paletteIndex = this.palette.push(state) - 1;
    }

    // Set the block state.
    this.blocks[BlockStorage.getIndex(bx, by, bz)] = paletteIndex;
  }

  /**
   * Calculates the index of the block position.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @returns The index of the block.
   */
  public static getIndex(bx: number, by: number, bz: number): number {
    return ((bx & 0xf) << 8) | ((bz & 0xf) << 4) | (by & 0xf);
  }

  /**
   * Serializes the block storage to a binary stream.
   *
   * @param stream The binary stream to write to.
   */
  public static serialize(
    storage: BlockStorage,
    stream: BinaryStream,
    nbt = false
  ): void {
    // Calculate bits per block based on the palette size
    let bitsPerBlock = Math.ceil(Math.log2(storage.palette.length));

    // Set bitsPerBlock to 1 if calculated as 0, and pad as necessary
    switch (bitsPerBlock) {
      case 0: {
        bitsPerBlock = 1;
        break;
      }
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6: {
        break;
      }
      case 7:
      case 8: {
        bitsPerBlock = 8;
        break;
      }
      default: {
        bitsPerBlock = 16;
        break;
      }
    }

    // Write the bits per block (shifted and flagged)
    stream.writeByte((bitsPerBlock << 1) | 1);

    // Calculate block and word sizes
    const blocksPerWord = Math.floor(32 / bitsPerBlock);
    const wordCount = Math.ceil(4096 / blocksPerWord);

    // Serialize the blocks into the words
    for (let w = 0; w < wordCount; w++) {
      // Prepare the word
      let word = 0;

      // Iterate over the blocks in the word
      for (let block = 0; block < blocksPerWord; block++) {
        // Calculate the block index
        const index = w * blocksPerWord + block;

        // Check if the block index is out of bounds
        if (index >= 4096) break; // Handle any excess blocks

        // Calculate the block state and offset
        const state = storage.blocks[index] ?? 0;
        const offset = block * bitsPerBlock;

        // Write the block state to the word
        word |= state << offset;
      }

      // Write the word to the stream
      stream.writeInt32(word, Endianness.Little);
    }

    // Write palette size depending on the serialization type
    if (nbt) stream.writeInt32(storage.palette.length, Endianness.Little);
    else stream.writeZigZag(storage.palette.length);

    // Serialize palette values
    for (const state of storage.palette) {
      // Check if the serialization type is NBT
      if (nbt) {
        // Get the permutation from the state
        const permutation = BlockPermutation.permutations.get(state);

        // Check if the permutation exists
        if (!permutation)
          throw new Error(`Unknown permutation state: ${state}`);

        // Serialize the permutation to NBT
        const data = BlockPermutation.toNbt(permutation);

        // Write the NBT data to the stream
        CompoundTag.write(stream, data);
      } else {
        // Write the state to the stream
        stream.writeZigZag(state);
      }
    }
  }

  /**
   * Deserializes the block storage from a binary stream.
   *
   * @param stream The binary stream to read from.
   * @returns The block storage.
   */
  public static deserialize(stream: BinaryStream, nbt = false): BlockStorage {
    // Read the bits per block
    const paletteAndFlag = stream.readByte();
    const bitsPerBlock = paletteAndFlag >> 1;

    // Check if the palette is using runtime IDs.
    const _isRuntime = (paletteAndFlag & 1) !== 0;

    // Calculate block and word sizes
    const blocksPerWord = Math.floor(32 / bitsPerBlock);
    const wordCount = Math.ceil(4096 / blocksPerWord);

    // Deserialize the words into blocks
    const words = Array.from<number>({ length: wordCount });
    for (let index = 0; index < wordCount; index++) {
      words[index] = stream.readInt32(Endianness.Little);
    }

    // Read the palette size depending on the serialization
    const paletteSize = nbt
      ? stream.readInt32(Endianness.Little)
      : stream.readZigZag();

    // Deserialize the palette values
    const palette = Array.from<number>({ length: paletteSize });
    for (let index = 0; index < paletteSize; index++) {
      // Check if the serialization type is NBT
      if (nbt) {
        // Read the NBT data from the stream
        const data = CompoundTag.read(stream);

        // Deserialize the permutation from NBT
        const permutation = BlockPermutation.fromNbt(data);

        // Check if the permutation exists
        if (!permutation) throw new Error(`Unknown permutation state: ${data}`);

        // Assign the permutation to the palette
        palette[index] = permutation.network;
      } else {
        // Read the state from the stream
        palette[index] = stream.readZigZag();
      }
    }

    // Deserialize the blocks from the words
    const blocks = Array.from<number>({ length: 4096 });
    let position = 0;

    // Iterate over the words
    for (const word of words) {
      // Iterate over the blocks in the word
      for (
        let block = 0;
        block < blocksPerWord && position < 4096;
        block++, position++
      ) {
        // Get the state from the word
        const state =
          (word >> (block * bitsPerBlock)) & ((1 << bitsPerBlock) - 1);

        // Adjust the position
        const x = (position >> 8) & 0xf;
        const y = position & 0xf;
        const z = (position >> 4) & 0xf;

        // Set the block state in the blocks array
        blocks[BlockStorage.getIndex(x, y, z)] = state;
      }
    }

    return new BlockStorage(palette, blocks);
  }
}

export { BlockStorage };
