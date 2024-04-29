import { DataType } from "@serenityjs/raknet";

import type { SkinImage } from "./skin-image";

class SerializedSkin extends DataType {
	public readonly identifier: string;
	public readonly playFabIdentifier: string;
	public readonly skinImage: SkinImage;
}

export { SerializedSkin };
