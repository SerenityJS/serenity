import {
  VarInt,
  ZigZong,
  VarString,
  Float32,
  Endianness
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import {
  BossEventColor,
  BossEventOverlay,
  type BossEventUpdateType,
  Packet
} from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.BossEvent)
class BossEventPacket extends DataPacket {
  @Serialize(ZigZong) public targetUniqueId!: bigint;
  @Serialize(ZigZong) public playerUniqueId!: bigint;
  @Serialize(VarInt) public type!: BossEventUpdateType;
  @Serialize(VarString) public title!: string;
  @Serialize(VarString) public filteredTitle!: string;
  @Serialize(Float32, { endian: Endianness.Little }) public percent!: number;
  @Serialize(VarInt) public color!: BossEventColor;
  @Serialize(VarInt) public overlay!: BossEventOverlay;
}

export { BossEventPacket };
