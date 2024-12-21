import { ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetHealth)
class SetHealthPacket extends DataPacket {
  @Serialize(ZigZag) public health!: number;
}

export { SetHealthPacket };
