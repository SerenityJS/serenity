import { Endianness, Float32, VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type AnimateId, Packet } from "../../enums";
import { AnimateAction } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Animate)
class AnimatePacket extends DataPacket {
  @Serialize(ZigZag) public id!: AnimateId;
  @Serialize(VarLong) public runtimeEntityId!: bigint;
  @Serialize(Float32, { endian: Endianness.Little })
  public data!: number;
  @Serialize(AnimateAction) public boatRowingTime!: number | null;
}

export { AnimatePacket };
