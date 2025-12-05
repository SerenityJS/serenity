import { Proto, Serialize } from "@serenityjs/raknet";
import { Bool } from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.TickingAreasLoadStatus)
class TickingAreasLoadStatusPacket extends DataPacket {
  @Serialize(Bool) public waitingPayload!: boolean;
}

export { TickingAreasLoadStatusPacket };
