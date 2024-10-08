import { ZigZong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.RemoveEntity)
class RemoveEntityPacket extends DataPacket {
  @Serialize(ZigZong) public uniqueEntityId!: bigint;
}

export { RemoveEntityPacket };
