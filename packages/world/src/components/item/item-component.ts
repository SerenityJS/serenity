import { Component } from "../component";

import type { ItemStack } from "../../item";

class ItemComponent extends Component {
	/**
	 * The item the component is binded to.
	 */
	protected readonly item: ItemStack;

	/**
	 * Creates a new item component.
	 *
	 * @param item The item the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new item component.
	 */
	public constructor(item: ItemStack, identifier: string) {
		super(identifier);
		this.item = item;

		// Register the component to the item.
		this.item.components.set(this.identifier, this);
	}
}

export { ItemComponent };
