import { ZigZag, VarString, Bool } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId, DisconnectReason } from '../enums/index.js';

@Packet(PacketId.Disconnect)
class Disconnect extends DataPacket {
	@Serialize(ZigZag) public reason!: DisconnectReason;
	@Serialize(Bool) public hideDisconnectionScreen!: boolean;
	@Serialize(VarString) public message!: string;
}

export { Disconnect };
