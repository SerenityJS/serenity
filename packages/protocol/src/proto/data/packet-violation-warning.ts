import { VarString, ZigZag } from "@serenityjs/binarystream";

import {
  Packet,
  type ViolationSeverity,
  type ViolationType
} from "../../enums";
import { Proto, Serialize } from "../../decorators";

import { DataPacket } from "./data-packet";

@Proto(Packet.PacketViolationWarning)
class PacketViolationWarningPacket extends DataPacket {
  @Serialize(ZigZag) public type!: ViolationType;
  @Serialize(ZigZag) public severity!: ViolationSeverity;
  @Serialize(ZigZag) public packet!: Packet;
  @Serialize(VarString) public context!: string;
}

export { PacketViolationWarningPacket };
