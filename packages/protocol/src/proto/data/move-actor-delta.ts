import { Proto, Serialize } from "@serenityjs/raknet";
import { Endianness, Float32, Uint16, VarLong } from "@serenityjs/binarystream";

import { Packet } from "../../enums";
import { RotationByte } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MoveActorDelta)
class MoveActorDeltaPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(Uint16, Endianness.Little) public flags!: number;
  @Serialize(Float32, Endianness.Little) public x!: number;
  @Serialize(Float32, Endianness.Little) public y!: number;
  @Serialize(Float32, Endianness.Little) public z!: number;
  @Serialize(RotationByte) public pitch!: number;
  @Serialize(RotationByte) public yaw!: number;
  @Serialize(RotationByte) public headYaw!: number;
}

export { MoveActorDeltaPacket };
