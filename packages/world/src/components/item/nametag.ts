import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { ItemComponent } from "./item-component";

import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemNametagComponent<T extends keyof Items> extends ItemComponent<T> {
	public static readonly identifier = "minecraft:nametag";

	public defaultValue = "";

	public currentValue = this.defaultValue;

	/**
	 * Creates a new item nametag component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item nametag component.
	 */
	public constructor(item: ItemStack<T>) {
		super(item, ItemNametagComponent.identifier);
	}

	public setCurrentValue(value: string): void {
		// Set the current value.
		this.currentValue = value;

		// Update the stacks nbt.
		// Check if a display tag exists.
		if (!this.item.nbt.hasTag("display")) {
			// Create a new display tag.
			const displayTag = new CompoundTag("display", {});

			// Add the nametag to the display tag.
			this.item.nbt.addTag(displayTag);
		}

		// Get the display tag.
		const displayTag = this.item.nbt.getTag("display") as CompoundTag<unknown>;

		// Check if a Name tag exists.
		if (displayTag.hasTag("Name")) displayTag.removeTag("Name");

		// Set the new Name tag.
		const nameTag = new StringTag("Name", value);

		// Add the Name tag to the display tag.
		displayTag.addTag(nameTag);

		// Update the item in the container.
		this.item.update();
	}

	public resetToDefault(): void {
		this.setCurrentValue(this.defaultValue);
	}

	public equals(component: ItemComponent<T>): boolean {
		// Check if the component is an instance of the item nametag component.
		if (!(component instanceof ItemNametagComponent)) return false;

		// Compare the current values.
		return this.currentValue === component.currentValue;
	}

	public static serialize<T extends keyof Items>(
		nbt: CompoundTag,
		component: ItemNametagComponent<T>
	): void {
		nbt.createStringTag("NameTag", component.currentValue);
	}

	public static deserialize<T extends keyof Items>(
		nbt: CompoundTag,
		item: ItemStack<T>
	): ItemNametagComponent<T> {
		// Create a new item nametag component.
		const component = new ItemNametagComponent(item);

		// Get the NameTag string tag.
		const nametag = nbt.getTag<StringTag>("NameTag");

		// Check if the NameTag tag exists
		if (!nametag) throw new Error("NameTag tag not found");

		// Set the current value.
		component.setCurrentValue(nametag.value);

		// Return the component.
		return component;
	}
}

export { ItemNametagComponent };
