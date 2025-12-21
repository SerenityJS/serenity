import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";
import { PacketDataTypeOptions } from "@serenityjs/raknet";

import { SubChunkHeightMapDataType, SubChunkRequestResult } from "../../enums";

import { SubChunkRequestPositionOffset } from "./subchunk-request-position-offset";

class SubChunkRequestEntry extends DataType {
  /**
   * The offset of the subchunk entry.
   */
  public offset: SubChunkRequestPositionOffset;

  /**
   * The result of the subchunk entry.
   */
  public result: SubChunkRequestResult;

  /**
   * The serialized payload of the subchunk entry.
   */
  public payload: Buffer;

  /**
   * The height map type of the subchunk entry.
   */
  public heightMapType: SubChunkHeightMapDataType;

  /**
   * The height map payload of the subchunk entry.
   */
  public heightMapPayload: Buffer | null;

  /**
   * The render height map type of the subchunk entry.
   */
  public renderHeightMapType: SubChunkHeightMapDataType;

  /**
   * The render height map payload of the subchunk entry.
   */
  public renderHeightMapPayload: Buffer | null;

  /**
   * The cache blob ID of the subchunk entry.
   * If caching is disabled, this will be null.
   */
  public cacheBlobId: bigint | null;

  /**
   * Creates an instance of SubChunkRequestResult.
   * @param offset The offset of the subchunk entry.
   * @param result The result of the subchunk entry.
   * @param payload The serialized payload of the subchunk entry.
   * @param heightMapType The height map type of the subchunk entry.
   * @param heightMapPayload The height map payload of the subchunk entry.
   * @param renderHeightMapType The render height map type of the subchunk entry.
   * @param renderHeightMapPayload The render height map payload of the subchunk entry.
   * @param cacheBlobId The cache blob ID of the subchunk entry.
   */
  public constructor(
    offset: SubChunkRequestPositionOffset,
    result: SubChunkRequestResult,
    payload: Buffer,
    heightMapType: SubChunkHeightMapDataType,
    heightMapPayload: Buffer | null,
    renderHeightMapType: SubChunkHeightMapDataType,
    renderHeightMapPayload: Buffer | null,
    cacheBlobId: bigint | null
  ) {
    super();
    this.offset = offset;
    this.result = result;
    this.payload = payload;
    this.heightMapType = heightMapType;
    this.heightMapPayload = heightMapPayload;
    this.renderHeightMapType = renderHeightMapType;
    this.renderHeightMapPayload = renderHeightMapPayload;
    this.cacheBlobId = cacheBlobId;
  }

  public static read(
    stream: BinaryStream,
    options?: PacketDataTypeOptions<boolean>
  ): Array<SubChunkRequestEntry> {
    // Get whether caching is enabled from the options.
    const cacheEnabled = options?.parameter ?? false;

    // Read the count of entries.
    const count = stream.readUint32(Endianness.Little);

    // Prepare the entries array and read each result.
    const results: Array<SubChunkRequestEntry> = [];
    for (let i = 0; i < count; i++) {
      // Read the request offset.
      const offset = SubChunkRequestPositionOffset.read(stream);

      // Read the request result.
      const result = stream.readInt8() as SubChunkRequestResult;

      // Read the payload.
      const payload = stream.read(stream.readVarInt());

      // Read the height map type.
      const heightMapType = stream.readUint8() as SubChunkHeightMapDataType;

      // Read the height map payload if it exists.
      let heightMapPayload: Buffer | null = null;
      if (heightMapType === SubChunkHeightMapDataType.HasData) {
        heightMapPayload = stream.read(256);
      }

      // Read the render height map type.
      const renderHeightMapType =
        stream.readUint8() as SubChunkHeightMapDataType;

      // Read the render height map payload if it exists.
      let renderHeightMapPayload: Buffer | null = null;
      if (renderHeightMapType === SubChunkHeightMapDataType.HasData) {
        renderHeightMapPayload = stream.read(256);
      }

      // Read the cache blob ID if caching is enabled.
      let cacheBlob: bigint | null = null;
      if (cacheEnabled) {
        cacheBlob = stream.readUint64(Endianness.Little);
      }

      // Push the entry to the results array.
      results.push(
        new this(
          offset,
          result,
          payload,
          heightMapType,
          heightMapPayload,
          renderHeightMapType,
          renderHeightMapPayload,
          cacheBlob
        )
      );
    }

    // Return the results.
    return results;
  }

  public static write(
    stream: BinaryStream,
    value: Array<SubChunkRequestEntry>,
    options?: PacketDataTypeOptions<boolean>
  ): void {
    // Get whether caching is enabled from the options.
    const cacheEnabled = options?.parameter ?? false;

    // Write the count of entries.
    stream.writeUint32(value.length, Endianness.Little);

    // Write each entry.
    for (const entry of value) {
      // Write the request offset.
      SubChunkRequestPositionOffset.write(stream, entry.offset);

      // Write the request result.
      stream.writeInt8(entry.result);

      // Write the payload.
      stream.writeVarInt(entry.payload.length);
      stream.write(entry.payload);

      // Write the height map type.
      stream.writeUint8(entry.heightMapType);

      // Write the height map payload if it exists.
      if (entry.heightMapType === SubChunkHeightMapDataType.HasData) {
        stream.write(entry.heightMapPayload!);
      }

      // Write the render height map type.
      stream.writeUint8(entry.renderHeightMapType);

      // Write the render height map payload if it exists.
      if (entry.renderHeightMapType === SubChunkHeightMapDataType.HasData) {
        stream.write(entry.renderHeightMapPayload!);
      }

      // Write the cache blob ID if caching is enabled.
      if (cacheEnabled) {
        stream.writeUint64(entry.cacheBlobId ?? 0n, Endianness.Little);
      }
    }
  }
}

export { SubChunkRequestEntry };
