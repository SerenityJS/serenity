import { Float32, Endianness, VarLong, VarInt } from "@serenityjs/binarystream";
import { Proto, Serialize } from "@serenityjs/raknet";

import { Packet } from "../../enums";
import { Vector3f, Vector2f } from "../types";

import { DataPacket } from "./data-packet";

@Proto(Packet.PlayerAuthInput)
class PlayerAuthInputPacket extends DataPacket {
	@Serialize(Float32, Endianness.Little) public pitch!: number;
	@Serialize(Float32, Endianness.Little) public yaw!: number;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Vector2f) public motion!: Vector2f;
	@Serialize(Float32, Endianness.Little) public headYaw!: number;
	@Serialize(VarLong) public inputData!: bigint;
	@Serialize(VarInt) public inputMode!: number;
	@Serialize(VarInt) public playMode!: number;
	@Serialize(VarInt) public newInteractionModel!: number;
	@Serialize(VarLong) public currentTick!: bigint;
	@Serialize(Vector3f) public positionDelta!: Vector3f;
}

export { PlayerAuthInputPacket };
