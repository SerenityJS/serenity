import { VarString } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ScriptMessage)
class ScriptMessage extends DataPacket {
	@Serialize(VarString) public messageId!: string;
	@Serialize(VarString) public data!: string;
}

export { ScriptMessage };
