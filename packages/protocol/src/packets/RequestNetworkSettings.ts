import { Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.RequestNetworkSettings)
class RequestNetworkSettings extends DataPacket {
	@Serialize(Int32) public protocol!: number;
}

export { RequestNetworkSettings };
