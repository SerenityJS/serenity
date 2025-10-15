import { BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Dimension } from "../../dimension";
import { Chunk } from "../../chunk";

class LevelDBKeyBuilder {
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
    stream.writeUint8(0x2c);

    // Return the buffer from the stream
    return stream.getBuffer();
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
    stream.writeUint8(0x2f);

    // Write the subchunk index to the stream.
    stream.writeInt8(cy);

    // Return the buffer from the stream.
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
    stream.writeUint8(49); // Block actor list key symbol

    // Return the buffer from the stream.
    return stream.getBuffer();
  }

  /**
   * Build an entity storage key for the database.
   * @param uniqueId The unique identifier of the entity.
   * @returns The buffer key for the entity storage
   */
  public static buildEntityStorageKey(uniqueId: bigint): Buffer {
    // Create a new BinaryStream instance with a prefix.
    const stream = new BinaryStream(Buffer.from("actorprefix", "ascii"));

    // Write the unique identifier to the stream.
    stream.writeInt64(uniqueId, Endianness.Little);

    // Return the buffer from the stream.
    return stream.getBuffer();
  }

  public static buildBiomeStorageKey(
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
    if (index !== 0) stream.writeInt32(index, Endianness.Little);

    // Write the biome key symbol to the stream.
    stream.writeUint8(0x2b);

    // Return the buffer from the stream
    return stream.getBuffer();
  }
}

export { LevelDBKeyBuilder };
