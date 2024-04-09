import { Endianness } from "@serenityjs/binarystream";
import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ResourcePackChunkData)
class ResourcePackChunkDataPacket extends DataPacket {
	public packId!: string;
	public chunkId!: number;
	public byteOffset!: bigint;
	public chunkData!: Buffer;

	public override serialize(): Buffer {
		this.writeVarInt(Packet.ResourcePackChunkData);
		this.writeVarString(this.packId);
		this.writeUint32(this.chunkId, Endianness.Little);
		this.writeUint64(this.byteOffset, Endianness.Little);

		this.writeVarInt(this.chunkData.byteLength);
		this.writeBuffer(this.chunkData);

		return this.getBuffer();
	}

	public override deserialize(): this {
		this.readVarInt();
		this.packId = this.readVarString();
		this.chunkId = this.readUint32(Endianness.Little);
		this.byteOffset = this.readUint64(Endianness.Little);

		const length = this.readVarInt();
		this.chunkData = this.readBuffer(length);

		return this;
	}
}

export { ResourcePackChunkDataPacket };
