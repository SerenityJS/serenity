import { VarInt, ZigZong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type BossEventUpdateType, Packet } from "../../enums";
import { BossEventAdd, BossEventUpdate } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.BossEvent)
class BossEventPacket extends DataPacket {
  @Serialize(ZigZong) public targetUniqueId!: bigint;
  @Serialize(VarInt) public type!: BossEventUpdateType;
  @Serialize(BossEventAdd, { parameter: "type" }) public add!: BossEventAdd;
  @Serialize(BossEventUpdate, { parameter: "type" })
  public update!: BossEventUpdate;
}

export { BossEventPacket };
