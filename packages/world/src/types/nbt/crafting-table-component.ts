import type { IntTag, ListTag, StringTag } from "@serenityjs/nbt";

interface CraftingTableComponentNBT {
	/**
	 * The crafting tags of the crafting table.
	 */
	crafting_tags: ListTag<StringTag>;

	/**
	 * The grid size of the crafting table.
	 */
	grid_size: IntTag;

	/**
	 * The name of the crafting table.
	 */
	table_name: StringTag;
}

export { CraftingTableComponentNBT };
