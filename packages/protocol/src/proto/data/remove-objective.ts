import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.RemoveObjective)
class RemoveObjectivePacket extends DataPacket {
	@Serialize(VarString) public objectiveName!: string;
}

export { RemoveObjectivePacket };
