import { VarInt, VarLong } from "@serenityjs/binarystream";

import { Serialize, Proto } from "../../decorators";
import { MovementEffectType, Packet } from "../../enums";

import { DataPacket } from "./data-packet";

@Proto(Packet.MovementEffect)
class MovementEffectPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(VarInt) public type!: MovementEffectType;
  @Serialize(VarInt) public duration!: number;
  @Serialize(VarLong) public inputTick!: bigint;
}

export { MovementEffectPacket };
