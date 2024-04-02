import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

import type { DimensionType } from "../../enums";
import type { Buffer } from "node:buffer";

@Proto(Packet.LevelChunk)
class LevelChunkPacket extends DataPacket {
	public x!: number;
	public z!: number;
	public dimension!: DimensionType;
	public subChunkCount!: number;
	public cacheEnabled!: boolean;
	public blobs!: Array<bigint>;
	public data!: Buffer;

	public override serialize(): Buffer {
		this.writeVarInt(Packet.LevelChunk);
		this.writeZigZag(this.x);
		this.writeZigZag(this.z);
		this.writeZigZag(this.dimension);
		if (this.cacheEnabled) {
			this.writeVarInt(-2);
			this.writeUint16(this.subChunkCount, Endianness.Little);
		} else {
			this.writeVarInt(this.subChunkCount);
		}

		this.writeBool(this.cacheEnabled);
		if (this.blobs) {
			this.writeVarInt(this.blobs.length);
			for (const hash of this.blobs) {
				this.writeUint64(hash, Endianness.Little);
			}
		}

		this.writeVarInt(this.data.byteLength);
		this.writeBuffer(this.data);

		return this.getBuffer();
	}

	public override deserialize(): this {
		this.readVarInt();
		this.x = this.readZigZag();
		this.z = this.readZigZag();
		this.dimension = this.readZigZag();
		this.subChunkCount = this.readVarInt();
		if (this.subChunkCount === -2) {
			this.subChunkCount = this.readUint16(Endianness.Little);
		}

		this.cacheEnabled = this.readBool();
		if (this.cacheEnabled) {
			const blobCount = this.readVarInt();
			this.blobs = [];
			for (let index = 0; index < blobCount; index++) {
				this.blobs.push(this.readUint64(Endianness.Little));
			}
		}

		const length = this.readVarInt();
		this.data = this.readBuffer(length);

		return this;
	}
}

export { LevelChunkPacket };
