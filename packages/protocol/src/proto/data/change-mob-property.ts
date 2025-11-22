import { Proto, Serialize } from "@serenityjs/raknet";
import {
  Bool,
  Float32,
  VarInt,
  VarString,
  ZigZong
} from "@serenityjs/binarystream";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.ChangeMobProperty)
class ChangeMobPropertyPacket extends DataPacket {
  @Serialize(ZigZong) public actorRuntimeId!: bigint;
  @Serialize(VarString) public propertyName!: string;
  @Serialize(Bool) public boolComponent!: boolean;
  @Serialize(VarString) public stringComponent!: string;
  @Serialize(VarInt) public intComponent!: number;
  @Serialize(Float32) public floatComponent!: number;
}

export { ChangeMobPropertyPacket };
