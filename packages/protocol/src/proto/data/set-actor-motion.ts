import { VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.SetActorMotion)
class SetActorMotionPacket extends DataPacket {
  @Serialize(VarLong) public runtimeId!: bigint;
  @Serialize(Vector3f) public motion!: Vector3f;
  @Serialize(VarLong) public tick!: bigint;
}

export { SetActorMotionPacket };
