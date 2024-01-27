import { Uint8, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.RequestChunkRadius)
class RequestChunkRadius extends DataPacket {
	@Serialize(ZigZag) public radius!: number;
	@Serialize(Uint8) public maxRadius!: number;
}

export { RequestChunkRadius };
