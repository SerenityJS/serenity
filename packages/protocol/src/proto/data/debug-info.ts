import { Proto, Serialize } from "@serenityjs/raknet";
import { VarString, ZigZong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.DebugInfo)
class DebugInfoPacket extends DataPacket {
  @Serialize(ZigZong) public actorUniqueId!: bigint;
  @Serialize(VarString) public data!: string;
}

export { DebugInfoPacket };
