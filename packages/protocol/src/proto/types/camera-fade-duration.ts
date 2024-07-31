import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

class CameraFadeDuration extends DataType {
	public fadeIn: number;
	public hold: number;
	public fadeOut: number;

	public constructor(fadeIn: number, holdDuration: number, fadeOut: number) {
		super();
		this.fadeIn = fadeIn;
		this.hold = holdDuration;
		this.fadeOut = fadeOut;
	}

	public static write(stream: BinaryStream, value: CameraFadeDuration): void {
		stream.writeFloat32(value.fadeIn, Endianness.Little);
		stream.writeFloat32(value.hold, Endianness.Little);
		stream.writeFloat32(value.fadeOut, Endianness.Little);
	}
}

export { CameraFadeDuration };
