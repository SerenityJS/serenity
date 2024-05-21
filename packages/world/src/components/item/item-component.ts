import { Component } from "../component";

import type { Player } from "../../player";
import type { Items } from "@serenityjs/item";
import type { ItemStack } from "../../item";

class ItemComponent<T extends keyof Items> extends Component {
	/**
	 * A collective registry of all item components.
	 */
	public static readonly components = new Map<string, typeof ItemComponent>();

	/**
	 * The item the component is binded to.
	 */
	protected readonly item: ItemStack<T>;

	/**
	 * Creates a new item component.
	 *
	 * @param item The item the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new item component.
	 */
	public constructor(item: ItemStack<T>, identifier: string) {
		super(identifier);
		this.item = item;

		// Register the component to the item.
		this.item.components.set(this.identifier, this);
	}

	/**
	 * Clones the item component.
	 * @param item The item stack to clone the component to.
	 * @returns A new item component.
	 */
	public clone(item: ItemStack<T>): this {
		// Create a new instance of the component.
		const component = new (this.constructor as new (
			item: ItemStack<T>,
			identifier: string
		) => ItemComponent<T>)(item, this.identifier) as this;

		// Copy the key-value pairs.
		for (const [key, value] of Object.entries(this)) {
			// Skip the item.
			if (key === "item") continue;

			// @ts-expect-error
			component[key] = value;
		}

		// Return the component.
		return component;
	}

	/**
	 * Called when the item has started to be used.
	 * @param player The player that started to use the item.
	 */
	public onStartUse?(player?: Player): void;

	/**
	 * Called when the item has stopped being used.
	 * @param player The player that stopped using the item.
	 */
	public onStopUse?(player?: Player): void;

	/**
	 * Called when the item has been used.
	 * @param player The player that used the item.
	 */
	public onUse?(player?: Player): void;
}

export { ItemComponent };
