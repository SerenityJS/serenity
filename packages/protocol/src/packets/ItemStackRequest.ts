import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { ItemStackRequests } from '../types/index.js';

@Packet(PacketId.ItemStackRequest)
class ItemStackRequest extends DataPacket {
	@Serialize(ItemStackRequests) public requests!: ItemStackRequests[];
}

export { ItemStackRequest };
