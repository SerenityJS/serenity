import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

import { CreativeItem } from "./creative";
import { ItemType } from "./type";
import { ItemCategory, type ItemGroup } from "./enums";

import type { Items } from "./types";
import type { BlockType } from "@serenityjs/block";

class CustomItemType extends ItemType {
	/**
	 * The network identifier counter for custom item types.
	 */
	public static network = 10_000;

	/**
	 * The category of the item.
	 */
	public readonly category: ItemCategory;

	/**
	 * The group of the item.
	 */
	public readonly group: ItemGroup | null;

	/**
	 * Create a new custom item type.
	 * @param identifier The identifier of the custom item type.
	 * @param category The category of the custom item type.
	 * @param group The group of the custom item type.
	 * @param block The block of the custom item type.
	 */
	public constructor(
		identifier: string,
		block?: BlockType,
		category?: ItemCategory,
		group?: ItemGroup
	) {
		super(
			identifier as keyof Items,
			CustomItemType.network++,
			true,
			64,
			block as Items[keyof Items]
		);

		// Assign the category and group.
		this.category = category ?? ItemCategory.None;
		this.group = group ?? null;

		// Register the item type.
		ItemType.types.set(identifier, this);

		// If the custom item type has a creative category, register it as a creative item.
		if (this.category !== ItemCategory.None) {
			// Register the creative item.
			CreativeItem.register(this, 0);
		}
	}

	/**
	 * Get the block property of the custom item type.
	 * @param type The custom item type.
	 */
	public static getBlockProperty(type: CustomItemType): CompoundTag {
		// Create the compound tag.
		const compound = new CompoundTag("", {});

		// Check if the custom item type has a block.
		if (!type.block) return compound;

		// Create the vanilla block data tag.
		const data = new CompoundTag("vanilla_block_data", {});
		data.addTag(new IntTag("block_id", type.network));

		// Create the menu category tag.
		const menu = new CompoundTag("menu_category", {});
		menu.addTag(new StringTag("category", type.category));
		if (type.group) menu.addTag(new StringTag("group", type.group));

		// Create the molang version tag.
		const molang = new IntTag("molang_version", 0);

		// Add the tags to the root tag.
		return compound.addTag(data, menu, molang);
	}
}

export { CustomItemType };
