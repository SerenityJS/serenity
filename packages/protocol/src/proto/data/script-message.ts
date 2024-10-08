import { VarString } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ScriptMessage)
class ScriptMessagePacket extends DataPacket {
  @Serialize(VarString) public messageId!: string;
  @Serialize(VarString) public data!: string;
}

export { ScriptMessagePacket };
