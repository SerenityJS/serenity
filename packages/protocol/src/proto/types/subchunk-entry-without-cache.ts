import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { HeightMapDataType, SubChunkResult } from "../../enums";

import { Vector3i } from "./vector3i";

export class SubChunkEntryWithoutCache extends DataType {
  public offset: Vector3i;
  public result: SubChunkResult;
  public payload: Buffer;
  public heightMap: HeightMapDataType;
  public heightMapData: Buffer | null = null;
  public renderHeightMap: HeightMapDataType;
  public renderHeightMapData: Buffer | null = null;

  public constructor(
    offset: Vector3i,
    result: SubChunkResult,
    payload: Buffer,
    heightMap: HeightMapDataType,
    heightMapData: Buffer | null,
    renderHeightMap: HeightMapDataType,
    renderHeightMapData: Buffer | null
  ) {
    super();
    this.offset = offset;
    this.result = result;
    this.payload = payload;
    this.heightMap = heightMap;
    this.heightMapData = heightMapData;
    this.renderHeightMap = renderHeightMap;
    this.renderHeightMapData = renderHeightMapData;
  }

  public static read(stream: BinaryStream): Array<SubChunkEntryWithoutCache> {
    const entryCount = stream.readUint32(Endianness.Little);
    const entries: Array<SubChunkEntryWithoutCache> = [];

    for (let i = 0; i < entryCount; i++) {
      const offset = Vector3i.read(stream);
      const result = stream.readInt8() as SubChunkResult;
      const payload = stream.read(stream.readVarInt());

      const heightMap = stream.readUint8() as HeightMapDataType;
      let heightMapData: Buffer | null = null;

      if (heightMap === HeightMapDataType.HAS_DATA) {
        heightMapData = stream.read(256);
      }

      const renderHeightMap = stream.readUint8() as HeightMapDataType;
      let renderHeightMapData: Buffer | null = null;

      if (renderHeightMap === HeightMapDataType.HAS_DATA) {
        renderHeightMapData = stream.read(256);
      }

      entries.push(
        new SubChunkEntryWithoutCache(
          offset,
          result,
          payload,
          heightMap,
          heightMapData,
          renderHeightMap,
          renderHeightMapData
        )
      );
    }
    return entries;
  }

  public static write(
    stream: BinaryStream,
    value: Array<SubChunkEntryWithoutCache>
  ): void {
    stream.writeUint32(value.length, Endianness.Little);

    for (const entry of value) {
      Vector3i.write(stream, entry.offset);
      stream.writeInt8(entry.result);
      stream.writeVarInt(entry.payload.length);
      stream.write(entry.payload);

      stream.writeUint8(entry.heightMap);
      if (
        entry.heightMap === HeightMapDataType.HAS_DATA &&
        entry.heightMapData
      ) {
        stream.write(entry.heightMapData);
      }

      stream.writeUint8(entry.renderHeightMap);
      if (
        entry.renderHeightMap === HeightMapDataType.HAS_DATA &&
        entry.renderHeightMapData
      ) {
        stream.write(entry.renderHeightMapData);
      }
    }
  }
}
