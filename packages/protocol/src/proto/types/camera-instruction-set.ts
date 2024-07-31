import { DataType } from "@serenityjs/raknet";
import { Bool, Endianness, type BinaryStream } from "@serenityjs/binarystream";

import { CameraSetEasing } from "./camera-set-easing";
import { Optional } from "./optional";
import { Vector3f } from "./vector3f";
import { Vector2f } from "./vector2f";

class CameraSetInstruction extends DataType {
	public runtimeId: number;
	public easing?: CameraSetEasing;
	public position?: Vector3f;
	public rotation?: Vector2f;
	public facing?: Vector3f;

	public constructor(
		runtimeId: number,
		easing?: CameraSetEasing,
		position?: Vector3f,
		rotation?: Vector2f,
		facing?: Vector3f
	) {
		super();
		this.runtimeId = runtimeId;
		this.easing = easing;
		this.position = position;
		this.rotation = rotation;
		this.facing = facing;
	}

	public static write(stream: BinaryStream, value: CameraSetInstruction): void {
		stream.writeInt32(value.runtimeId, Endianness.Little);
		Optional.write(stream, value.easing, undefined, null, CameraSetEasing);
		Optional.write(stream, value.position, undefined, null, Vector3f);
		Optional.write(stream, value.rotation, undefined, null, Vector2f);
		Optional.write(stream, value.facing, undefined, null, Vector3f);
		Optional.write(stream, undefined, undefined, undefined, Bool);
	}
}

export { CameraSetInstruction };
