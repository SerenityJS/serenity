import { Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.Login)
class Login extends DataPacket {
	@Serialize(Int32) public protocol!: number;
}

export { Login };
