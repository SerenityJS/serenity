import { Uint8, ZigZag } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.RequestChunkRadius)
class RequestChunkRadius extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
	@Serialize(Uint8) public maxRadius!: number;
}

export { RequestChunkRadius };
