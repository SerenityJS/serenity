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

		// Update the item in the container.
		this.item.update();
	}

	public resetToDefault(): void {
		this.setCurrentValue(this.defaultValue);
	}
}

export { ItemNametagComponent };
