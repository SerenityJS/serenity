import { BinaryStream, Endianness } from "@serenityjs/binarystream";

class BiomeStorage {
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
   * The size of the block storage.
   */
  public readonly size: [number, number, number];

  /**
   * The palette of the storage.
   */
  public readonly palette: Array<number>;

  /**
   * The biomes of the storage.
   */
  public readonly biomes: Array<number>;

  /**
   * Creates a new biome storage.
   *
   * @param biomes The optional biomes.
   * @param palette The optional palette.
   * @param size The size of the biome storage.
   */
  public constructor(
    palette?: Array<number>,
    biomes?: Array<number>,
    size?: [number, number, number]
  ) {
    // Calculate the size.
    this.size = size ?? [
      BiomeStorage.MAX_X,
      BiomeStorage.MAX_Y,
      BiomeStorage.MAX_Z
    ];

    // Calculate the total size.
    const totalSize = this.size[0] * this.size[1] * this.size[2];

    // Create the palette with at least the air biome.
    this.palette = palette ?? Array.from({ length: 1 }, () => 0);

    // Create the biomes array with the given size.
    this.biomes = biomes ?? Array.from({ length: totalSize }, () => 0);
  }

  /**
   * Checks if the block storage is empty.
   */
  public isEmpty(): boolean {
    return this.palette.length === 1 && this.palette[0] === 0;
  }

  /**
   * Gets the biome at the given block coordinates.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @returns The biome.
   */
  public getBiome(bx: number, by: number, bz: number): number {
    // Calculate the index.
    const index = this.getIndex(bx, by, bz);

    // Get the palette index.
    const paletteIndex = this.biomes[index] ?? 0;

    // Return the block.
    return this.palette[paletteIndex] ?? 1;
  }

  /**
   * Sets the biome at the given block coordinates.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @param state The biome.
   */
  public setBiome(bx: number, by: number, bz: number, state: number): void {
    // Check if the state exists in the palette.
    let paletteIndex = this.palette.indexOf(state);
    if (paletteIndex === -1) {
      // Add the state to the palette.
      paletteIndex = this.palette.push(state) - 1;
    }

    // Set the biome.
    this.biomes[this.getIndex(bx, by, bz)] = paletteIndex;
  }

  /**
   * Calculates the index of the block position.
   *
   * @param bx The x coordinate of the block.
   * @param by The y coordinate of the block.
   * @param bz The z coordinate of the block.
   * @returns The index of the block.
   */
  public getIndex(bx: number, by: number, bz: number): number {
    // Dynamically calculate the index based on size of the block storage.
    const dx = (bx & (this.size[0] - 1)) << 8; // Shift x by 8 bits
    const dy = by & (this.size[1] - 1); // y is not shifted
    const dz = (bz & (this.size[2] - 1)) << 4; // Shift z by 4 bits

    // Ensure the result is an unsigned integer
    return (dx | dy | dz) >>> 0;
  }

  /**
   * Serializes the biome storage to a binary stream.
   *
   * @param stream The binary stream to write to.
   */
  public static serialize(
    storage: BiomeStorage,
    stream: BinaryStream,
    disk = false
  ): void {
    // Calculate bits per biome based on the palette size
    let bitsPerBiome = Math.ceil(Math.log2(storage.palette.length));

    // Set bitsPerBiome to 1 if calculated as 0, and pad as necessary
    switch (bitsPerBiome) {
      case 0:
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
        bitsPerBiome = 8;
        break;
      }
      default: {
        bitsPerBiome = 16;
        break;
      }
    }

    // Write the bits per biome (shifted and flagged)
    stream.writeUint8(bitsPerBiome << 1);

    // Calculate biome and word sizes
    const biomesPerWord = Math.floor(32 / bitsPerBiome);
    const wordCount = Math.ceil(this.MAX_SIZE / biomesPerWord);

    // console.log("  bitsPerBiome", bitsPerBiome);
    // console.log("  biomesPerWord", biomesPerWord);
    // console.log("  wordCount", wordCount);

    if (bitsPerBiome === 0) {
      // No need to write any biomes, just write the single palette entry
      stream.writeInt32(storage.palette[0]!, Endianness.Little);
    } else {
      // Serialize the biomes into the words
      for (let w = 0; w < wordCount; w++) {
        // Prepare the word
        let word = 0;

        // Iterate over the biomes in the word
        for (let biome = 0; biome < biomesPerWord; biome++) {
          // Calculate the biome index
          const index = w * biomesPerWord + biome;

          // Check if the biome index is out of bounds
          if (index >= 4096) break; // Handle any excess biomes

          // Calculate the biome state and offset
          const state = storage.biomes[index] ?? 0;
          const offset = biome * bitsPerBiome;

          // Write the biome state to the word
          word |= state << offset;
        }

        // Write the word to the stream
        stream.writeInt32(word, Endianness.Little);
      }

      // Write palette size to the stream
      if (disk) stream.writeInt32(storage.palette.length, Endianness.Little);
      else stream.writeZigZag(storage.palette.length);

      // Serialize palette values
      for (const state of storage.palette) {
        // Write the state to the stream
        if (disk) stream.writeInt32(state, Endianness.Little);
        else stream.writeZigZag(state);
      }
    }
  }

  /**
   * Deserializes the biome storage from a binary stream.
   *
   * @param stream The binary stream to read from.
   * @returns The biome storage.
   */
  public static deserialize(stream: BinaryStream, disk = false): BiomeStorage {
    // Read the bits per block
    const paletteAndFlag = stream.readUint8();
    const bitsPerBiome = paletteAndFlag >> 1;

    // Check if the storage is empty
    if (bitsPerBiome === 0x7f) return new BiomeStorage();
    // Handle special case for 0 bits per biome
    else if (bitsPerBiome === 0) {
      // Read the single palette value
      const palette = [
        disk ? stream.readInt32(Endianness.Little) : stream.readZigZag()
      ];

      // Create a biomes array filled with zeros indicating the first palette entry
      const biomes = Array.from<number>({ length: this.MAX_SIZE }).fill(0);

      // Return the biome storage
      return new BiomeStorage(palette, biomes);
    } else {
      // Calculate block and word sizes
      const biomesPerWord = Math.floor(32 / bitsPerBiome);
      const wordCount = Math.ceil(this.MAX_SIZE / biomesPerWord);

      // Deserialize the words into blocks
      const words = Array.from<number>({ length: wordCount });
      for (let index = 0; index < wordCount; index++) {
        words[index] = stream.readInt32(Endianness.Little);
      }

      // Read the palette size from the stream
      const paletteSize = disk
        ? stream.readInt32(Endianness.Little)
        : stream.readZigZag();

      // Deserialize the palette values
      const palette = Array.from<number>({ length: paletteSize });
      for (let index = 0; index < paletteSize; index++) {
        // Read the state from the stream depending on the format
        if (disk) palette[index] = stream.readInt32(Endianness.Little);
        else palette[index] = stream.readZigZag();
      }

      // Deserialize the biomes from the words
      const biomes = Array.from<number>({ length: 4096 }).fill(0);
      let position = 0;

      // Create a new BiomeStorage instance
      const storage = new BiomeStorage(palette, biomes);

      // Iterate over the words
      for (const word of words) {
        // Iterate over the biomes in the word
        for (
          let biome = 0;
          biome < biomesPerWord && position < 4096;
          biome++, position++
        ) {
          // Get the state from the word
          const state =
            (word >> (biome * bitsPerBiome)) & ((1 << bitsPerBiome) - 1);

          // Adjust the position
          const x = (position >> 8) & 0xf;
          const y = position & 0xf;
          const z = (position >> 4) & 0xf;

          // Set the biome in the biomes array
          biomes[storage.getIndex(x, y, z)] = state;
        }
      }

      // Return the deserialized biome storage
      return storage;
    }
  }
}

export { BiomeStorage };
