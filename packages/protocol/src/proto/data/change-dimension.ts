import { ZigZag, Bool } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type DimensionType, Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ChangeDimension)
class ChangeDimensionPacket extends DataPacket {
  @Serialize(ZigZag) public dimension!: DimensionType;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Bool) public respawn!: boolean;
  @Serialize(Bool) public hasLoadingScreen!: boolean;
}

export { ChangeDimensionPacket };
