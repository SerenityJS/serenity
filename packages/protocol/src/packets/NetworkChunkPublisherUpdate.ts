import { VarInt } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { BlockCoordinates, ChunkCoords } from '../types/index.js';

@Packet(PacketId.NetworkChunkPublisherUpdate)
class NetworkChunkPublisherUpdate extends DataPacket {
	@Serialize(BlockCoordinates) public coordinate!: BlockCoordinates;
	@Serialize(VarInt) public radius!: number;
	@Serialize(ChunkCoords) public savedChunks!: ChunkCoords[];
}

export { NetworkChunkPublisherUpdate };
