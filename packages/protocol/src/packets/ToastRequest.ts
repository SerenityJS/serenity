import { Uint8, Bool, VarString, Endianness } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { ChatTypes, Packet as PacketId } from '../enums';

@Packet(PacketId.ToastRequest)
class ToastRequest extends DataPacket {
	@Serialize(VarString) public Title!: string;
	@Serialize(VarString) public Message!: string;
}

export { ToastRequest };
