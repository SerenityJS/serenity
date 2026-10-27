import { VarString, ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.DebugInfo)
class DebugInfoPacket extends DataPacket {
  @Serialize(ZigZong) public actorUniqueId!: bigint;
  @Serialize(VarString) public data!: string;
}

export { DebugInfoPacket };
