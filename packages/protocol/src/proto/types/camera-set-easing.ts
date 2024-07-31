import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

import type { EasingType } from "../../enums";

class CameraSetEasing extends DataType {
	public type: EasingType;
	public duration: number;

	public constructor(type: EasingType, duration: number) {
		super();
		this.type = type;
		this.duration = duration;
	}

	public static write(stream: BinaryStream, value: CameraSetEasing): void {
		stream.writeUint8(value.type);
		stream.writeFloat32(value.duration, Endianness.Little);
	}
}

export { CameraSetEasing };
