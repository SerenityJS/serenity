import {
  Bool,
  Endianness,
  Int64,
  VarInt,
  VarString,
  ZigZag
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type LevelSoundEvent, Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LevelSoundEvent)
class LevelSoundEventPacket extends DataPacket {
  @Serialize(VarInt) public event!: LevelSoundEvent;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(ZigZag) public data!: number;
  @Serialize(VarString) public actorIdentifier!: string;
  @Serialize(Bool) public isBabyMob!: boolean;
  @Serialize(Bool) public isGlobal!: boolean;
  @Serialize(Int64, Endianness.Little) public uniqueActorId!: bigint;
}

export { LevelSoundEventPacket };
