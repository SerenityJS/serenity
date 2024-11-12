import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.TakeItemActor)
class TakeItemActorPacket extends DataPacket {
  @Serialize(VarLong) public itemRuntimeId!: bigint;
  @Serialize(VarLong) public targetRuntimeId!: bigint;
}

export { TakeItemActorPacket };
