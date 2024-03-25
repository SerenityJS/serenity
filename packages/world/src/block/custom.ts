import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockIdentifier, ItemCategory, ItemGroup } from "../enums";

import { BlockType } from "./type";

class CustomBlockType extends BlockType {
	/**
	 * The creative category of the block.
	 */
	public readonly category: ItemCategory;

	/**
	 * The creative category group of the block.
	 */
	public readonly group: ItemGroup | null;

	/**
	 * Create a custom block type.
	 * @param identifier The identifier of the block.
	 * @param category The creative category of the block.
	 * @param group The creative category group of the block.
	 */
	public constructor(
		identifier: string,
		category?: ItemCategory,
		group?: ItemGroup
	) {
		super(identifier as BlockIdentifier, -1);
		this.category = category ?? ItemCategory.None;
		this.group = group ?? null;

		CustomBlockType.types.set(identifier, this);
	}

	public static getBlockProperty(type: CustomBlockType): CompoundTag {
		// Create the root tag.
		const root = new CompoundTag("", {});

		// Create the vanilla block data tag.
		const data = new CompoundTag("vanilla_block_data", {});
		data.addTag(new IntTag("block_id", 10_000)); // TODO: Get the block ID from the registry.

		// Create the menu category tag.
		const menu = new CompoundTag("menu_category", {});
		menu.addTag(new StringTag("category", type.category));
		if (type.group) menu.addTag(new StringTag("group", type.group));

		// Create the molang version tag.
		const molang = new IntTag("molang_version", 0);

		// Add the tags to the root tag.
		root.addTag(data, menu, molang);

		// Return the root tag.
		return root;
	}
}

export { CustomBlockType };
