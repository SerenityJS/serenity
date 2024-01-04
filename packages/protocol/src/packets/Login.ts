import { Int32 } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { LoginTokens, Tokens } from '../types';

@Packet(PacketId.Login)
class Login extends DataPacket {
	@Serialize(Int32) public protocol!: number;
	@Serialize(LoginTokens) public tokens!: Tokens;
}

export { Login };
