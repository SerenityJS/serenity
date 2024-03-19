import { VarLong, ZigZag } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { AnimateId, Packet } from "../../enums";
import { AnimateAction } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Animate)
class AnimatePacket extends DataPacket {
	@Serialize(ZigZag) public id!: AnimateId;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(AnimateAction) public boatRowingTime!: number | null;
}

export { AnimatePacket };
