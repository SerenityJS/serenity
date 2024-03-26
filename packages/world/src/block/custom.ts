import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockIdentifier } from "../enums";
import { CustomItemType } from "../item";

import { BlockType } from "./type";

class CustomBlockType extends BlockType {
	public readonly item: CustomItemType;

	/**
	 * Create a custom block type.
	 * @param identifier The identifier of the block.
	 */
	public constructor(identifier: string, item: CustomItemType) {
		super(identifier as BlockIdentifier, -1, item);

		// Set the item.
		this.item = item;

		// Register the block type to the custom item type.
		item.block = this;

		// Register the block type to the collective map.
		CustomBlockType.types.set(identifier, this);
	}

	public static getBlockProperty(type: CustomBlockType): CompoundTag {
		// Create the root tag.
		const root = new CompoundTag("", {});

		// Create the vanilla block data tag.
		const data = new CompoundTag("vanilla_block_data", {});
		data.addTag(new IntTag("block_id", type.item.network)); // TODO: Get the block ID from the registry.

		// Create the menu category tag.
		const menu = new CompoundTag("menu_category", {});
		menu.addTag(new StringTag("category", type.item.category));
		if (type.item.group) menu.addTag(new StringTag("group", type.item.group));

		// Create the molang version tag.
		const molang = new IntTag("molang_version", 0);

		// Add the tags to the root tag.
		root.addTag(data, menu, molang);

		// Return the root tag.
		return root;
	}
}

export { CustomBlockType };
