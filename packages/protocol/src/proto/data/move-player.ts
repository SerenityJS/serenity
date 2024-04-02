import {
	Float32,
	Endianness,
	Uint8,
	Bool,
	VarLong
} from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { MoveMode, Packet } from "../../enums";
import { Vector3f, TeleportCause } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.MovePlayer)
class MovePlayerPacket extends DataPacket {
	@Serialize(VarLong) public runtimeId!: bigint;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(Uint8) public mode!: MoveMode;
	@Serialize(Bool) public onGround!: boolean;
	@Serialize(VarLong) public riddenRuntimeId!: bigint;
	@Serialize(TeleportCause, Endianness.Little)
	public cause!: TeleportCause | null;

	@Serialize(VarLong) public tick!: bigint;
}

export { MovePlayerPacket };
