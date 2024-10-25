import { Uint8, Endianness, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { type InteractAction, Packet } from "../../enums";
import { InteractPosition, type Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Interact)
class InteractPacket extends DataPacket {
  @Serialize(Uint8) public action!: InteractAction;
  @Serialize(VarLong) public actorRuntimeId!: bigint;
  @Serialize(InteractPosition, Endianness.Big, "action")
  public position!: Vector3f;
}

export { InteractPacket };
