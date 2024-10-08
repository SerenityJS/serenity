import { Uint8, VarLong } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, type RespawnState } from "../../enums";
import { Vector3f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.Respawn)
class RespawnPacket extends DataPacket {
  @Serialize(Vector3f) public position!: Vector3f;
  @Serialize(Uint8) public state!: RespawnState;
  @Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { RespawnPacket };
