import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { HeightMapDataType, SubChunkResult } from "../../enums";

import { Vector3i } from "./vector3i";

export class SubChunkEntryWithCache extends DataType {
  public offset: Vector3i;
  public result: SubChunkResult;
  public payload: Buffer | null;
  public heightMap: HeightMapDataType;
  public heightMapData: Buffer | null = null;
  public renderHeightMap: HeightMapDataType;
  public renderHeightMapData: Buffer | null = null;
  public blobId: bigint = 0n;

  public constructor(
    offset: Vector3i,
    result: SubChunkResult,
    payload: Buffer | null,
    heightMap: HeightMapDataType,
    heightMapData: Buffer | null,
    renderHeightMap: HeightMapDataType,
    renderHeightMapData: Buffer | null,
    blobId: bigint = 0n
  ) {
    super();
    this.offset = offset;
    this.result = result;
    this.payload = payload;
    this.heightMap = heightMap;
    this.heightMapData = heightMapData;
    this.renderHeightMap = renderHeightMap;
    this.renderHeightMapData = renderHeightMapData;
    this.blobId = blobId;
  }

  public static read(stream: BinaryStream): Array<SubChunkEntryWithCache> {
    const entryCount = stream.readUint32(Endianness.Little);
    const entries: Array<SubChunkEntryWithCache> = [];

    for (let i = 0; i < entryCount; i++) {
      const offset = Vector3i.read(stream);
      const result = stream.readInt8() as SubChunkResult;
      let payload: Buffer | null = null;
      if (result === SubChunkResult.SUCCESS_ALL_AIR) {
        payload = null;
      } else {
        payload = stream.read(stream.readVarInt());
      }
      const heightMap = stream.readInt8() as HeightMapDataType;
      let heightMapData: Buffer | null = null;
      if (heightMap === HeightMapDataType.HAS_DATA) {
        heightMapData = stream.read(256);
      }

      const renderHeightMap = stream.readInt8() as HeightMapDataType;
      let renderHeightMapData: Buffer | null = null;
      if (renderHeightMap === HeightMapDataType.HAS_DATA) {
        renderHeightMapData = stream.read(256);
      }

      const blobId = stream.readUint64(Endianness.Little);
      entries.push(
        new SubChunkEntryWithCache(
          offset,
          result,
          payload,
          heightMap,
          heightMapData,
          renderHeightMap,
          renderHeightMapData,
          blobId
        )
      );
    }
    return entries;
  }
}
