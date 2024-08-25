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

	public serialize(tag: CompoundTag): CompoundTag {
		// Serialize the enchantments to the tag.
		const enchTag = new ListTag<CompoundTag>("ench", [], Tag.Compound);

		for (const [enchantment, level] of this.enchantments) {
			const ench = new CompoundTag("", {});

			ench.addTag(new ShortTag("id", enchantment));
			ench.addTag(new ShortTag("lvl", level));
			enchTag.value.push(ench);
		}

		tag.addTag(enchTag);

		return tag;
	}

	public deserialize(tag: CompoundTag): void {
		const enchanments: ListTag<CompoundTag> | undefined = tag.getTag("ench");

		if (!enchanments) return;
		this.enchantments.clear();
		for (const ench of enchanments.value) {
			const id = ench.getTag("id")?.value as number;
			const level = ench.getTag("lvl")?.value as number;

			if (id == undefined || level == undefined) continue;
			this.enchantments.set(id, level);
		}
	}
}

export { ItemEnchantableComponent };
