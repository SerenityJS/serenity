import { CustomItemType, type Items, ItemType } from "@serenityjs/item";

import type { BlockType } from "@serenityjs/block";

class ItemPalette {
	/**
	 * The registered item types for the palette.
	 */
	public readonly types = ItemType.types;

	/**
	 * Gets all item types from the palette.
	 * @returns All item types from the palette.
	 */
	public getAllTypes(): Array<ItemType> {
		return [...this.types.values()];
	}

	/**
	 * Gets all custom item types from the palette.
	 * @returns All custom item types from the palette.
	 */
	public getAllCustomTypes(): Array<CustomItemType> {
		return [...this.types.values()].filter(
			(type) => type instanceof CustomItemType
		) as Array<CustomItemType>;
	}

	/**
	 * Gets an item type from the palette.
	 * @param identifier The item identifier to get.
	 * @returns The item type from the palette.
	 */
	public getType<T extends keyof Items>(identifier: T): ItemType<T> | null {
		return this.types.get(identifier) as ItemType<T>;
	}

	/**
	 * Resolves an item type from the block type.
	 * @param type The block type to resolve.
	 * @returns The item type from the palette.
	 */
	public resolveType(type: BlockType): ItemType | null {
		return [...this.types.values()].find((item) => item.block === type) ?? null;
	}

	public registerType(type: ItemType): boolean {
		// Check if the item type is already registered.
		if (this.types.has(type.identifier)) return false;

		// Register the item type.
		this.types.set(type.identifier, type);

		// Return true if the item type was registered.
		return true;
	}
}

export { ItemPalette };
