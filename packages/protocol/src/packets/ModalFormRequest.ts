import { VarInt, VarString } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';

@Packet(PacketId.ModalFormRequest)
class ModalFormRequest extends DataPacket {
	@Serialize(VarInt) public formId!: number;
	@Serialize(VarString) public payload!: string;
}

export { ModalFormRequest };
