import { VarInt, Bool, Endianness } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { ModalFormCanceled, ModalFormData } from "../data";

import { DataPacket } from "./data-packet";

import type { ModalFormCanceledReason } from "../../enums";

@Proto(Packet.ModalFormResponse)
class ModalFormResponse extends DataPacket {
	@Serialize(VarInt) public id!: number;
	@Serialize(Bool) public response!: boolean;
	@Serialize(ModalFormData, Endianness.Big, "response") public data!:
		| string
		| null;

	@Serialize(Bool) public canceled!: boolean;
	@Serialize(ModalFormCanceled, Endianness.Big, "canceled")
	public reason!: ModalFormCanceledReason | null;
}

export { ModalFormResponse };
