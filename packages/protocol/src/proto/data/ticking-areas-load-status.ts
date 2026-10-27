import { Bool } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.TickingAreasLoadStatus)
class TickingAreasLoadStatusPacket extends DataPacket {
  @Serialize(Bool) public waitingPayload!: boolean;
}

export { TickingAreasLoadStatusPacket };
