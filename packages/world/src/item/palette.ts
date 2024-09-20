import {
	CustomItemType,
	type ItemIdentifier,
	type Items,
	ItemType
} from "@serenityjs/item";

import { ITEM_COMPONENTS, type ItemComponent } from "../components";

import type { BlockType } from "@serenityjs/block";

class ItemPalette {
	/**
	 * The registered item types for the palette.
	 */
	public readonly types = ItemType.types;

	/**
	 * The registered item components for the palette.
	 */
	public readonly components = new Map<string, typeof ItemComponent>();

	/**
	 * The registry for the item components.
	 */
	public readonly registry = new Map<
		ItemIdentifier,
		Array<typeof ItemComponent>
	>();

	public constructor() {
		// Register all item components.
		for (const component of ITEM_COMPONENTS) this.registerComponent(component);
	}

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

	public getRegistry(identifier: ItemIdentifier): Array<typeof ItemComponent> {
		// Get the registry for the item identifier.
		const registry = this.registry.get(identifier);

		// Return the registry for the item identifier.
		return registry ?? [];
	}

	public registerComponent(component: typeof ItemComponent): boolean {
		// Check if the item component is already registered.
		if (this.components.has(component.identifier)) return false;

		// Register the item component.
		this.components.set(component.identifier, component);

		// Iterate over the item types.
		for (const type of component.types) {
			// Check if the registry has the item identifier.
			if (!this.registry.has(type))
				// Set the registry for the item identifier.
				this.registry.set(type, []);

			// Get the registry for the item identifier.
			const registry = this.registry.get(type);

			// Check if the registry exists.
			if (registry) {
				// Push the component to the registry.
				registry.push(component);

				// Set the registry for the item identifier.
				this.registry.set(type, registry);
			}
		}

		// Return true if the item component was registered.
		return true;
	}

	public getAllComponents(): Array<typeof ItemComponent> {
		return [...this.components.values()];
	}

	public getComponent(identifier: string): typeof ItemComponent | null {
		return this.components.get(identifier) ?? null;
	}
}

export { ItemPalette };
