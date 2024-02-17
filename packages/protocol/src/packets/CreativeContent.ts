import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { CreativeItems } from '../types/index.js';

@Packet(PacketId.CreativeContent)
class CreativeContent extends DataPacket {
	@Serialize(CreativeItems) public items!: CreativeItems[];
}

export { CreativeContent };
