import type { Buffer } from 'node:buffer';
import { BIOME_DEFINITION_LIST } from '@serenityjs/bedrock-data';
import { Packet } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.BiomeDefinitionList)
class BiomeDefinitionList extends DataPacket {
	public override serialize(): Buffer {
		this.writeVarInt(PacketId.BiomeDefinitionList);
		this.writeBuffer(BIOME_DEFINITION_LIST);

		return this.getBuffer();
	}
}

export { BiomeDefinitionList };
