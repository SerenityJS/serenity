import { ZigZag } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetTime)
class SetTimePacket extends DataPacket {
  @Serialize(ZigZag) public time!: number;
}

export { SetTimePacket };
