import { VarLong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { PlayerAttributes } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.UpdateAttributes)
class UpdateAttributes extends DataPacket {
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(PlayerAttributes) public attributes!: Array<PlayerAttributes>;
	@Serialize(VarLong) public tick!: bigint;
}

export { UpdateAttributes };
