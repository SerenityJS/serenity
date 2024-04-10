import { ItemComponent } from "./item-component";

import type { ItemStack } from "../../item";

class ItemNametagComponent extends ItemComponent {
	public defaultValue = "";

	public currentValue = this.defaultValue;

	/**
	 * Creates a new item nametag component.
	 *
	 * @param item The item the component is binded to.
	 * @returns A new item nametag component.
	 */
	public constructor(item: ItemStack) {
		super(item, "minecraft:nametag");
	}

	public setCurrentValue(value: string): void {
		// Set the current value.
		this.currentValue = value;

		// Check if the item is in a container.
		if (!this.item.container) return;

		// Get the slot of the item in the container.
		const slot = this.item.container.storage.indexOf(this.item);

		// Set the item in the container.
		this.item.container.setItem(slot, this.item);
	}

	public resetToDefault(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { ItemNametagComponent };
