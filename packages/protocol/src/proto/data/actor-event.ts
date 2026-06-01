import { Uint8, VarLong, ZigZag } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.ActorEvent)
class ActorEventPacket extends DataPacket {
  @Serialize(VarLong) public actorRuntimeId!: bigint;
  @Serialize(Uint8) public event!: number;
  @Serialize(ZigZag) public data!: number;

  @Serialize(Vector3f, { optional: true })
  public firedAt!: Vector3f;
}

export { ActorEventPacket };
