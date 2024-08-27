import { CompoundTag, ListTag, ShortTag, Tag } from "@serenityjs/nbt";

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

		// Check if the item has no enchantments.
		if (!this.item.nbt.hasTag("ench")) this.item.nbt.removeTag("ench");

		// Create a new list tag for the enchantments.
		const enchTag = new ListTag<CompoundTag>("ench", [], Tag.Compound);

		// Iterate over the enchantments.
		for (const [enchantment, level] of this.enchantments) {
			// Create the enchantment tag.
			const ench = new CompoundTag("", {});

			// Create the id and level tags.
			const id = new ShortTag("id", enchantment);
			const lvl = new ShortTag("lvl", level);

			// Add the id and level tags to the enchantment tag.
			ench.addTag(id);
			ench.addTag(lvl);

			// Push the enchantment tag to the list tag.
			enchTag.value.push(ench);
		}

		// Add the enchantment list tag to the item.
		this.item.nbt.addTag(enchTag);

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

		// Check if the item has no enchantments.
		if (!this.item.nbt.hasTag("ench")) this.item.nbt.removeTag("ench");

		// Create a new list tag for the enchantments.
		const enchTag = new ListTag<CompoundTag>("ench", [], Tag.Compound);

		// Iterate over the enchantments.
		for (const [enchantment, level] of this.enchantments) {
			// Create the enchantment tag.
			const ench = new CompoundTag("", {});

			// Create the id and level tags.
			const id = new ShortTag("id", enchantment);
			const lvl = new ShortTag("lvl", level);

			// Add the id and level tags to the enchantment tag.
			ench.addTag(id);
			ench.addTag(lvl);

			// Push the enchantment tag to the list tag.
			enchTag.value.push(ench);
		}

		// Add the enchantment list tag to the item.
		this.item.nbt.addTag(enchTag);

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

	public equals(component: ItemComponent<T>): boolean {
		// Check if the component is an instance of the item enchantable component.
		if (!(component instanceof ItemEnchantableComponent)) return false;

		// Compare the enchantments.
		if (this.enchantments.size !== component.enchantments.size) return false;

		// Iterate over the enchantments and check if they are equal.
		for (const [enchantment, level] of this.enchantments) {
			// Check if the item has the enchantment.
			if (!component.enchantments.has(enchantment)) return false;

			// Get the level of the enchantment from the item.
			const other = component.enchantments.get(enchantment) as number;

			// Check if the levels are equal.
			if (level !== other) return false;
		}

		return true;
	}

	public static serialize<T extends keyof Items>(
		nbt: CompoundTag,
		component: ItemEnchantableComponent<T>
	): void {
		// Create a new list tag for the enchantments.
		const enchTag = new ListTag<CompoundTag>("ench", [], Tag.Compound);

		// Iterate over the enchantments.
		for (const [enchantment, level] of component.enchantments) {
			// Create the enchantment tag.
			const ench = new CompoundTag("", {});

			// Create the id and level tags.
			const id = new ShortTag("id", enchantment);
			const lvl = new ShortTag("lvl", level);

			// Add the id and level tags to the enchantment tag.
			ench.addTag(id);
			ench.addTag(lvl);

			// Push the enchantment tag to the list tag.
			enchTag.value.push(ench);
		}

		// Add the enchantment list tag to the item.
		nbt.addTag(enchTag);
	}

	public static deserialize<T extends keyof Items>(
		nbt: CompoundTag,
		itemStack: ItemStack<T>
	): ItemEnchantableComponent<T> {
		// Create a new item enchantable component.
		const component = new ItemEnchantableComponent(itemStack);

		// Check if the item has enchantments.
		if (!nbt.hasTag("ench")) return component;

		// Get the enchantment list tag.
		const enchTag = nbt.getTag<ListTag<CompoundTag>>("ench");

		// Check if the enchantment list tag is invalid.
		if (!enchTag) return component;

		// Iterate over the enchantments.
		for (const ench of enchTag.value) {
			// Get the id and level tags.
			const id = ench.getTag<ShortTag>("id");
			const lvl = ench.getTag<ShortTag>("lvl");

			// Check if the id or level tags are invalid.
			if (!id || !lvl) continue;

			// Add the enchantment to the item.
			component.addEnchantment(id.value, lvl.value);
		}

		return component;
	}
}

export { ItemEnchantableComponent };
