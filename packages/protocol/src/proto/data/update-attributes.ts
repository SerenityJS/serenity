import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Attribute } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAttributes)
class UpdateAttributesPacket extends DataPacket {
	@Serialize(VarLong) public runtimeActorId!: bigint;
	@Serialize(Attribute) public attributes!: Array<Attribute>;
	@Serialize(VarLong) public tick!: bigint;
}

export { UpdateAttributesPacket };
