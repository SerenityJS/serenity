import { VarInt } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { BlockCoordinates, ChunkCoords } from '../types';

@Packet(PacketId.NetworkChunkPublisherUpdate)
class NetworkChunkPublisherUpdate extends DataPacket {
	@Serialize(BlockCoordinates) public coordinate!: BlockCoordinates;
	@Serialize(VarInt) public radius!: number;
	@Serialize(ChunkCoords) public savedChunks!: ChunkCoords[];
}

export { NetworkChunkPublisherUpdate };
