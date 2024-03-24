import { CompoundTag, StringTag } from "@serenityjs/nbt";

interface ItemStackNbt {
	display?: CompoundTag<ItemStackDisplay> | null;
}

interface ItemStackDisplay {
	Name?: StringTag;
}

export { ItemStackNbt, ItemStackDisplay };
