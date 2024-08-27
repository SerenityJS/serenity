import { CompoundTag, ListTag, StringTag, Tag } from "@serenityjs/nbt";

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

		// Check if a display tag exists.
		if (!this.item.nbt.hasTag("display")) {
			// Create a new display tag.
			const displayTag = new CompoundTag("display", {});

			// Add the display tag to the item.
			this.item.nbt.addTag(displayTag);
		}

		// Get the display tag.
		const displayTag = this.item.nbt.getTag("display") as CompoundTag<unknown>;

		// Check if a Lore tag exists.
		if (displayTag.hasTag("Lore")) displayTag.removeTag("Lore");

		// Create the lore tag.
		const loreTag = new ListTag<StringTag>(
			"Lore",
			this.values.map((value) => new StringTag("", value)),
			Tag.String
		);

		// Add the lore tag to the display tag.
		displayTag.addTag(loreTag);

		// Update the item in the container.
		this.item.update();
	}

	/**
	 * Adds a lore value to the item.
	 * @param value The lore value to add.
	 */
	public addLore(value: string): void {
		// Add the lore value.
		this.setLore([...this.values, value]);

		// Update the item in the container.
		this.item.update();
	}

	public static serialize<T extends keyof Items>(
		nbt: CompoundTag,
		component: ItemComponent<T>
	): void {
		// Get the lore component.
		const loreComponent = component as ItemLoreComponent<T>;

		// Check if the lore component has any values.
		if (loreComponent.values.length === 0) return;

		// Check if a display tag exists.
		if (!nbt.hasTag("display")) {
			// Create a new display tag.
			const displayTag = new CompoundTag("display", {});

			// Add the display tag to the item.
			nbt.addTag(displayTag);
		}

		// Get the display tag.
		const displayTag = nbt.getTag("display") as CompoundTag<unknown>;

		// Check if a Lore tag exists.
		if (displayTag.hasTag("Lore")) displayTag.removeTag("Lore");

		// Create the lore tag.
		const loreTag = new ListTag<StringTag>(
			"Lore",
			loreComponent.values.map((value) => new StringTag("", value)),
			Tag.String
		);

		// Add the lore tag to the display tag.
		displayTag.addTag(loreTag);
	}

	public static deserialize<T extends keyof Items>(
		nbt: CompoundTag,
		itemStack: ItemStack<T>
	): ItemLoreComponent<T> {
		// Create a new item lore component.
		const component = new ItemLoreComponent(itemStack);

		// Check if a display tag exists.
		if (!nbt.hasTag("display")) return component;

		// Get the display tag.
		const displayTag = nbt.getTag("display") as CompoundTag<unknown>;

		// Check if a Lore tag exists.
		if (!displayTag.hasTag("Lore")) return component;

		// Get the lore tag.
		const loreTag = displayTag.getTag<ListTag<StringTag>>("Lore");

		// Check if the lore tag is invalid.
		if (!loreTag) return component;

		// Iterate over the lore values.
		for (const lore of loreTag.value) {
			// Add the lore value to the component.
			component.addLore(lore.value);
		}

		return component;
	}
}

export { ItemLoreComponent };
