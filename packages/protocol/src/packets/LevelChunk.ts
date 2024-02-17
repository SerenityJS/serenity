import type { Buffer } from 'node:buffer';
import { Endianness } from '@serenityjs/binarystream';
import { Packet } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import type { DimensionType } from '../enums/index.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.LevelChunk)
class LevelChunk extends DataPacket {
	public x!: number;
	public z!: number;
	public dimension!: DimensionType;
	public subChunkCount!: number;
	public cacheEnabled!: boolean;
	public blobs!: any[];
	public data!: Buffer;

	public override serialize(): Buffer {
		this.writeVarInt(PacketId.LevelChunk);
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
			for (let i = 0; i < blobCount; i++) {
				this.blobs.push(this.readUint64(Endianness.Little));
			}
		}

		const length = this.readVarInt();
		this.data = this.readBuffer(length);

		return this;
	}
}

export { LevelChunk };
