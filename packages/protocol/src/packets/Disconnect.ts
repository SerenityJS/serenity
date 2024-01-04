import { ZigZag, VarString, Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId, DisconnectReason } from '../enums';

@Packet(PacketId.Disconnect)
class Disconnect extends DataPacket {
	@Serialize(ZigZag) public reason!: DisconnectReason;
	@Serialize(Bool) public hideDisconnectionScreen!: boolean;
	@Serialize(VarString) public message!: string;
}

export { Disconnect };
