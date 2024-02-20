import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { ItemStackResponses } from '../types/index.js';

@Packet(PacketId.ItemStackResponse)
class ItemStackResponse extends DataPacket {
	@Serialize(ItemStackResponses) public responses!: ItemStackResponses[];
}

export { ItemStackResponse };
