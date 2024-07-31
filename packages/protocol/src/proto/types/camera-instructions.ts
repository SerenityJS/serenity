import { DataType } from "@serenityjs/raknet";
import { Bool, type BinaryStream } from "@serenityjs/binarystream";

import { Optional } from "./optional";
import { CameraSetInstruction } from "./camera-instruction-set";
import { CameraFadeInstruction } from "./camera-instruction-fade";

class CameraInstructions extends DataType {
	public Set?: CameraSetInstruction;
	public Clear?: boolean;
	public Fade?: unknown;

	public constructor(
		Set?: CameraSetInstruction,
		Clear?: boolean,
		Fade?: CameraFadeInstruction
	) {
		super();
		this.Set = Set;
		this.Clear = Clear;
		this.Fade = Fade;
	}

	public static write(stream: BinaryStream, value: CameraInstructions): void {
		Optional.write(stream, value.Set, undefined, null, CameraSetInstruction);
		Optional.write(stream, value.Clear, undefined, null, Bool);
		Optional.write(stream, value.Fade, undefined, null, CameraFadeInstruction);
	}
}

export { CameraInstructions };
