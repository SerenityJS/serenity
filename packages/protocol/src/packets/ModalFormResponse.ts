import { VarInt, Bool, Endianness } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import type { ModalFormCanceledReason } from '../enums';
import { Packet as PacketId } from '../enums';
import { ModalFormCanceled, ModalFormData } from '../types';

@Packet(PacketId.ModalFormResponse)
class ModalFormResponse extends DataPacket {
	@Serialize(VarInt) public id!: number;
	@Serialize(Bool) public response!: boolean;
	@Serialize(ModalFormData, Endianness.Big, 'response') public data!: string | null;
	@Serialize(Bool) public canceled!: boolean;
	@Serialize(ModalFormCanceled, Endianness.Big, 'canceled') public reason!: ModalFormCanceledReason | null;
}

export { ModalFormResponse };
