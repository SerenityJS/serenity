import { Uint8, Bool, VarString, Endianness } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { ChatTypes, Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.ToastRequest)
class ToastRequest extends DataPacket {
	@Serialize(VarString) public Title!: string;
	@Serialize(VarString) public Message!: string;
}

export { ToastRequest };
