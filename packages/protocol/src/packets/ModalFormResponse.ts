import { VarInt, Bool, Endianness } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import type { ModalFormCanceledReason } from '../enums/index.js';
import { Packet as PacketId } from '../enums/index.js';
import { ModalFormCanceled, ModalFormData } from '../types/index.js';

@Packet(PacketId.ModalFormResponse)
class ModalFormResponse extends DataPacket {
	@Serialize(VarInt) public id!: number;
	@Serialize(Bool) public response!: boolean;
	@Serialize(ModalFormData, Endianness.Big, 'response') public data!: string | null;
	@Serialize(Bool) public canceled!: boolean;
	@Serialize(ModalFormCanceled, Endianness.Big, 'canceled') public reason!: ModalFormCanceledReason | null;
}

export { ModalFormResponse };
