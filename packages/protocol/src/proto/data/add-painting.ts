import { ZigZong, ZigZag, VarString } from "@serenityjs/binarystream";
import { Serialize, Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.AddPainting)
class AddPaintingPacket extends DataPacket {
  @Serialize(ZigZong) public uniqueId!: bigint;
  @Serialize(ZigZong) public runtimeId!: bigint;
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(ZigZag) public direction!: number;
  @Serialize(VarString) public name!: string;
}

export { AddPaintingPacket };
