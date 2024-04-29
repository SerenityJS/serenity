import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { Vector3f } from "./vector3f";

class SerializedSkin extends DataType {
	public readonly identifier: string;
	public readonly playFabIdentifier: string;
	public readonly skinResourcePatch: string;
}

export { SerializedSkin };
