import type { Buffer } from 'node:buffer';
import { Packet } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.BiomeDefinitionList)
class BiomeDefinitionList extends DataPacket {
	public biomes!: Buffer;

	public override serialize(): Buffer {
		this.writeVarInt(PacketId.BiomeDefinitionList);
		this.writeBuffer(this.biomes);

		return this.getBuffer();
	}

	public override deserialize(): this {
		this.readVarInt();
		this.biomes = this.readRemainingBuffer();

		return this;
	}
}

export { BiomeDefinitionList };
