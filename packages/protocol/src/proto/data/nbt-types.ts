import { DataType } from "@serenityjs/raknet";
import { BedrockNBT } from "@serenityjs/nbt";

import type { NBTCompoud, NBTValue } from "@serenityjs/nbt";
import type { BinaryStream } from "@serenityjs/binaryutils";

class NBTTagItemData extends DataType {
	public static write(stream: BinaryStream, value: NBTValue): void {
		BedrockNBT.WriteRootTag(stream, value);
	}

	public static read(stream: BinaryStream): NBTCompoud {
		return BedrockNBT.ReadRootTag(stream) as NBTCompoud;
	}
}

export { NBTTagItemData };
