import { ZigZag, VarString, Bool, Endianness } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.Disconnect)
class Disconnect extends DataPacket {
	@Serialize(ZigZag) public reason!: number;
	@Serialize(Bool) public hideDisconnectionScreen!: boolean;
	@Serialize(VarString) public message!: string;
}

export { Disconnect };
