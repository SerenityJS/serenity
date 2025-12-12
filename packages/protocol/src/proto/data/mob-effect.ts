import { Bool, Uint8, VarInt, VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type EffectType, type MobEffectEvents, Packet } from "../../enums";
import { PlayerInputTick } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MobEffect)
class MobEffectPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(Uint8) public eventId!: MobEffectEvents;
  @Serialize(ZigZag) public effectId!: EffectType;
  @Serialize(ZigZag) public amplifier!: number;
  @Serialize(Bool) public particles!: boolean;
  @Serialize(VarInt) public duration!: number;
  @Serialize(PlayerInputTick) public inputTick!: bigint;
  @Serialize(Bool) public isAmbient!: boolean;
}

export { MobEffectPacket };
