import { Proto, Serialize } from "@serenityjs/raknet";
import { VarLong, Bool } from "@serenityjs/binarystream";

import { DataPacket, Packet } from "../..";
import { Vector3f } from "../types";

@Proto(Packet.MotionPredictHints)
export class MotionPredictHintsPacket extends DataPacket {
  @Serialize(VarLong) public hints!: bigint;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Bool) public onGround!: boolean;
}
