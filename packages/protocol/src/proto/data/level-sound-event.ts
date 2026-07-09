import {
  Bool,
  Endianness,
  Int64,
  VarString,
  ZigZag
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.LevelSoundEvent)
class LevelSoundEventPacket extends DataPacket {
  /**
   * As of 1.26.30 r/26.3 LevelEvent is a string
   */
  @Serialize(VarString) public event!: string;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(ZigZag) public data!: number;
  @Serialize(VarString) public actorIdentifier!: string;
  @Serialize(Bool) public isBabyMob!: boolean;
  @Serialize(Bool) public isGlobal!: boolean;
  @Serialize(Int64, { endian: Endianness.Little })
  public uniqueActorId!: bigint;

  @Serialize(Vector3f, { optional: true })
  public firedAt?: Vector3f;
}

export { LevelSoundEventPacket };
