import { Int32 } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';
import { LoginTokens } from '../types/index.js';

@Packet(PacketId.Login)
class Login extends DataPacket {
	@Serialize(Int32) public protocol!: number;
	@Serialize(LoginTokens) public tokens!: LoginTokens;
}

export { Login };
