import { VarLong, ZigZag } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";

import { MovementEffectType, Packet } from "../../enums"
import { DataPacket } from "./data-packet";

@Proto(Packet.MovementEffect)
class MovementEffectPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(ZigZag) public type!: MovementEffectType;
  @Serialize(ZigZag) public duration!: number;
  @Serialize(PlayerInputTick) public inputTick!: bigint;
}

export { MovementEffectPacket };
