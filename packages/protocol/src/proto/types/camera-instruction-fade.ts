import { DataType } from "@serenityjs/raknet";

import { CameraFadeDuration } from "./camera-fade-duration";
import { Optional } from "./optional";
import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";

class CameraFadeInstruction extends DataType {
	public duration?: CameraFadeDuration;
	public color?: Vector3f;

	public constructor(duration?: CameraFadeDuration, color?: Vector3f) {
		super();
		this.duration = duration;
		this.color = color;
	}

	public static write(
		stream: BinaryStream,
		value: CameraFadeInstruction
	): void {
		Optional.write(stream, value.duration, undefined, null, CameraFadeDuration);
		Optional.write(stream, value.color, undefined, null, Vector3f);
	}
}

export { CameraFadeInstruction };
