import { Uint16 } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet, SimpleEventType } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SimpleEvent)
class SimpleEventPacket extends DataPacket {
  @Serialize(Uint16) public type!: SimpleEventType;
}

export { SimpleEventPacket };
