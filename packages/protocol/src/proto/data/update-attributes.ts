import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { PlayerAttributes } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAttributes)
class UpdateAttributesPacket extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(PlayerAttributes) public attributes!: Array<PlayerAttributes>;
	@Serialize(VarLong) public tick!: bigint;
}

export { UpdateAttributesPacket };
