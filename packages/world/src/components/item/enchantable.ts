import { ItemComponent } from "./item-component";

import type { Enchantment } from "@serenityjs/protocol";
import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemEnchantableComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:enchantable";

	/**
	 * A collective map of enchantments on the item.
	 */
	public readonly enchantments: Map<Enchantment, number> = new Map();

	/**
	 * Creates a new item enchantable component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item enchantable component.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemEnchantableComponent.identifier);
	}

	/**
	 * Gets the level of an enchantment on the item.
	 * @param enchantment The enchantment to get.
	 * @returns The level of the enchantment.
	 */
	public getEnchantment(enchantment: Enchantment): number | undefined {
		return this.enchantments.get(enchantment);
	}

	/**
	 * Gets all enchantments on the item.
	 * @returns A map of enchantments on the item.
	 */
	public getEnchantments(): Map<Enchantment, number> {
		return this.enchantments;
	}

	/**
	 * Checks if the item has an enchantment.
	 * @param enchantment The enchantment to check.
	 * @returns True if the item has the enchantment, false otherwise.
	 */
	public hasEnchantment(enchantment: Enchantment): boolean {
		return this.enchantments.has(enchantment);
	}

	/**
	 * Adds an enchantment to the item.
	 * @param enchantment The enchantment to add.
	 * @param level The level of the enchantment.
	 */
	public addEnchantment(enchantment: Enchantment, level: number): void {
		// Set the enchantment on the item.
		this.enchantments.set(enchantment, level);

		// Update the item in the container.
		this.item.update();
	}

	/**
	 * Removes an enchantment from the item.
	 * @param enchantment The enchantment to remove.
	 */
	public removeEnchantment(enchantment: Enchantment): void {
		// Remove the enchantment from the item.
		this.enchantments.delete(enchantment);

		// Update the item in the container.
		this.item.update();
	}

	/**
	 * Removes all enchantments from the item.
	 */
	public removeAllEnchantments(): void {
		// Clear all enchantments from the item.
		this.enchantments.clear();

		// Update the item in the container.
		this.item.update();
	}
}

export { ItemEnchantableComponent };
