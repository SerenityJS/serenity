import { ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.ChunkRadiusUpdate)
class ChunkRadiusUpdate extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
}

export { ChunkRadiusUpdate };
