import { ItemComponent } from "./item-component";

import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemLoreComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:lore";

	/**
	 * The lore values of the item.
	 */
	public readonly values: Array<string> = [];

	/**
	 * Creates a new item lore component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item lore component.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemLoreComponent.identifier);
	}

	/**
	 * Gets the lore of the item.
	 */
	public getLore(): Array<string> {
		// Get the lore values.
		return this.values;
	}

	/**
	 * Sets the lore of the item.
	 * @param values The lore values to set.
	 */
	public setLore(values: Array<string>): void {
		// Set the lore values.
		this.values.length = 0;
		this.values.push(...values);

		// Update the item in the container.
		this.item.update();
	}

	/**
	 * Adds a lore value to the item.
	 * @param value The lore value to add.
	 */
	public addLore(value: string): void {
		// Add the lore value.
		this.values.push(value);

		// Update the item in the container.
		this.item.update();
	}
}

export { ItemLoreComponent };
