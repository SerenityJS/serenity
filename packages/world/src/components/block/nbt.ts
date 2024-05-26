import { BlockComponent } from "./block-component";

import type { NBTTag } from "@serenityjs/nbt";

class BlockNBTComponent extends BlockComponent {
	/**
	 * Serializes the component to an NBT Compatable object.
	 */
	public static serialize(): NBTTag {
		throw new Error("BlockNBT.serialize() method is not implemented.");
	}

	/**
	 * Deserializes the component from an NBT Compatable object.
	 * @param _nbt The NBT Compatable object to deserialize.
	 */
	public static deserialize(_nbt: NBTTag): BlockNBTComponent {
		throw new Error("BlockNBT.deserialize() method is not implemented.");
	}
}

export { BlockNBTComponent };
