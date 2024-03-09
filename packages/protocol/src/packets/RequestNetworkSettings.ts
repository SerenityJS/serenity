import { Int32 } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.RequestNetworkSettings)
class RequestNetworkSettings extends DataPacket {
	@Serialize(Int32) public protocol!: number;
}

export { RequestNetworkSettings };
