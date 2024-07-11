import { Bool, Byte, Uint64, VarInt, VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";
import { DataPacket } from "./data-packet";
import { EffectType, MobEffectEvents, Packet } from "../../enums";

@Proto(Packet.MobEffect)
class MobEffectPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(Byte) public eventId!: MobEffectEvents;
  @Serialize(ZigZag) public effectId!: EffectType;
  @Serialize(VarInt) public amplifier!: number;
  @Serialize(Bool) public particles!: boolean;
  @Serialize(VarInt) public duration!: number;
  @Serialize(Uint64) public tick!: bigint;
}

export { MobEffectPacket };
