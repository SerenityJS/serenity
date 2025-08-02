import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

import type { DimensionType } from "../../enums";
import type { Buffer } from "node:buffer";

@Proto(Packet.LevelChunk)
class LevelChunkPacket extends DataPacket {
  private static readonly MAX_BLOB_HASHES = 64;

  public x!: number;
  public z!: number;
  public dimension!: DimensionType;
  public highestSubChunkCount!: number;
  public subChunkCount!: number;
  public cacheEnabled!: boolean;
  public blobs!: Array<bigint>;
  public data!: Buffer;

  public override serialize(): Buffer {
    this.writeVarInt(Packet.LevelChunk);
    this.writeZigZag(this.x);
    this.writeZigZag(this.z);
    this.writeZigZag(this.dimension);
    this.writeVarInt(this.subChunkCount);
    if (this.subChunkCount === -2) {
      this.writeUint16(this.highestSubChunkCount ?? 0, Endianness.Little);
    }
    this.writeBool(this.cacheEnabled);
    if (this.cacheEnabled) {
      if (!this.blobs)
        throw new Error("Blobs required when cache_enabled is true");
      this.writeVarInt(this.blobs.length);
      for (const hash of this.blobs) {
        this.writeUint64(hash, Endianness.Little);
      }
    }
    this.writeVarInt(this.data.length);
    this.write(this.data);
    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt(); // packet id
    this.x = this.readZigZag();
    this.z = this.readZigZag();
    this.dimension = this.readZigZag();
    this.subChunkCount = this.readVarInt();
    if (this.subChunkCount === 4294967294) this.subChunkCount = -2;

    if (this.subChunkCount === -2) {
      this.highestSubChunkCount = this.readUint16(Endianness.Little);
    }

    this.cacheEnabled = this.readBool();
    if (this.cacheEnabled) {
      const blobCount = this.readVarInt();
      if (blobCount > LevelChunkPacket.MAX_BLOB_HASHES) {
        throw new Error(`Too many blob hashes: ${blobCount}`);
      }

      this.blobs = [];
      for (let index = 0; index < blobCount; index++) {
        this.blobs.push(this.readInt64(Endianness.Little));
      }
    }

    const dataLength = this.readVarInt();
    this.data = this.read(dataLength);
    return this;
  }
}

export { LevelChunkPacket };
