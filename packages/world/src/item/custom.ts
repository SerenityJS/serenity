import { CustomBlockType } from "../block";
import { ItemCategory, ItemGroup, ItemIdentifier } from "../enums";

import { ItemType } from "./type";

/**
 * A custom item type.
 */
class CustomItemType extends ItemType {
	/**
	 * The network counter for custom item types.
	 */
	public static network: number = 10_000;

	/**
	 * The creative category of the custom item type.
	 */
	public readonly category: ItemCategory;

	/**
	 * The creative category group of the custom item type.
	 */
	public readonly group: ItemGroup | null;

	/**
	 * The custom block type of the custom item type, if acclicable.
	 */
	public block: CustomBlockType | null = null;

	/**
	 * Create a custom item type.
	 * @param identifier The identifier of the item.
	 * @param category The creative category of the item.
	 * @param group The creative category group of the item.
	 * @param block The block of the item.
	 */
	public constructor(
		identifier: string,
		category?: ItemCategory,
		group?: ItemGroup
	) {
		super(identifier as ItemIdentifier, CustomItemType.network++);

		this.category = category ?? ItemCategory.None;
		this.group = group ?? null;

		// Register the item type.
		ItemType.types.set(identifier, this);
	}
}

export { CustomItemType };
