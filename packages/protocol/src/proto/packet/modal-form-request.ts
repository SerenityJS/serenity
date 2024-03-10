import { VarInt, VarString } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ModalFormRequest)
class ModalFormRequest extends DataPacket {
	@Serialize(VarInt) public id!: number;
	@Serialize(VarString) public payload!: string;
}

export { ModalFormRequest };
