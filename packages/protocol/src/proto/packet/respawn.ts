import { Uint8, VarLong } from "@serenityjs/binaryutils";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet, RespawnState } from "../../enums";
import { Vector3f } from "../data";

import { DataPacket } from "./data-packet";

@Proto(Packet.Respawn)
class Respawn extends DataPacket {
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Uint8) public state!: RespawnState;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
}

export { Respawn };
