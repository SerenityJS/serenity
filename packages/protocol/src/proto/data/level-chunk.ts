import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

import type { DimensionType } from "../../enums";
import type { Buffer } from "node:buffer";

@Proto(Packet.LevelChunk)
class LevelChunkPacket extends DataPacket {
  private static readonly MAX_BLOB_HASHES = 64;

  private static readonly MAX_SUB_CHUNKS = 64;

  public x!: number;
  public z!: number;
  public dimension!: DimensionType;

  /**
   * The amount of sub chunks included in the payload.
   */
  public subChunkCount!: number;

  /**
   * The highest sub chunk the client may request, if the client should request the sub chunks itself.
   * Since v2168, this replaces the -2 sub chunk count sentinel.
   */
  public subChunkLimit?: number;

  public cacheEnabled!: boolean;

  /**
   * The blob hashes of the chunk; empty when caching is disabled.
   */
  public blobs: Array<bigint> = [];

  public data!: Buffer;

  public override serialize(): Buffer {
    // Reset the offset, as the same packet may be serialized more than once (e.g. when broadcasting)
    this.offset = 0;

    this.writeVarInt(Packet.LevelChunk);
    this.writeZigZag(this.x);
    this.writeZigZag(this.z);
    this.writeZigZag(this.dimension);

    // Write the amount of sub chunks, and the optional sub chunk request limit.
    this.writeVarInt(this.subChunkCount);
    this.writeBool(this.subChunkLimit !== undefined);
    if (this.subChunkLimit !== undefined) this.writeZigZag(this.subChunkLimit);

    // Write whether caching is enabled.
    this.writeBool(this.cacheEnabled);

    // The blob hashes are always written since v2168, empty when caching is disabled.
    if (this.cacheEnabled && this.blobs.length === 0)
      throw new Error("Blobs required when cache_enabled is true");

    const blobs = this.cacheEnabled ? this.blobs : [];
    this.writeVarInt(blobs.length);
    for (const hash of blobs) {
      this.writeUint64(hash, Endianness.Little);
    }

    // Write the chunk payload.
    this.writeVarInt(this.data.length);
    this.write(this.data);

    return this.getBuffer();
  }

  public override deserialize(): this {
    this.readVarInt(); // packet id
    this.x = this.readZigZag();
    this.z = this.readZigZag();
    this.dimension = this.readZigZag();

    // Read the amount of sub chunks, and the optional sub chunk request limit.
    this.subChunkCount = this.readVarInt();
    if (this.subChunkCount > LevelChunkPacket.MAX_SUB_CHUNKS) {
      throw new Error(`Too many sub chunks: ${this.subChunkCount}`);
    }

    this.subChunkLimit = this.readBool() ? this.readZigZag() : undefined;

    // Read whether caching is enabled.
    this.cacheEnabled = this.readBool();

    // Read the blob hashes, which are always present.
    const blobCount = this.readVarInt();
    if (blobCount > LevelChunkPacket.MAX_BLOB_HASHES) {
      throw new Error(`Too many blob hashes: ${blobCount}`);
    }

    this.blobs = [];
    for (let index = 0; index < blobCount; index++) {
      this.blobs.push(this.readUint64(Endianness.Little));
    }

    // Read the chunk payload.
    const dataLength = this.readVarInt();
    this.data = this.read(dataLength);

    return this;
  }
}

export { LevelChunkPacket };
