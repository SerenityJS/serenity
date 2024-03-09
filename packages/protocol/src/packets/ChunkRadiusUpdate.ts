import { ZigZag } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.ChunkRadiusUpdate)
class ChunkRadiusUpdate extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
}

export { ChunkRadiusUpdate };
