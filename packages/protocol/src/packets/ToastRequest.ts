import { VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.ToastRequest)
class ToastRequest extends DataPacket {
	@Serialize(VarString) public title!: string;
	@Serialize(VarString) public message!: string;
}

export { ToastRequest };
