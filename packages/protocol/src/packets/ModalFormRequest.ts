import { VarInt, VarString } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { Packet as PacketId } from '../enums/index.js';

@Packet(PacketId.ModalFormRequest)
class ModalFormRequest extends DataPacket {
	@Serialize(VarInt) public id!: number;
	@Serialize(VarString) public payload!: string;
}

export { ModalFormRequest };
