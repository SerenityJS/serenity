import { Component } from "../component";

import type { ItemIdentifier, Items } from "@serenityjs/item";
import type { ItemUseOptions } from "../../options";
import type { CompoundTag } from "@serenityjs/nbt";
import type { ItemUseMethod } from "@serenityjs/protocol";
import type { ItemStack } from "../../item";

class ItemComponent<T extends keyof Items> extends Component {
	/**
	 * The item the component is binded to.
	 */
	public static readonly types: Array<ItemIdentifier> = [];

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
	 * Checks if the item component equals another item component.
	 * @param component The item component to compare.
	 * @returns True if the item component equals the other item component, false otherwise.
	 */
	public equals(component: ItemComponent<T>): boolean {
		return this.identifier === component.identifier;
	}

	/**
	 * Called when the item has started to be used.
	 * @param options The options of the item use.
	 */
	public onStartUse?(options: ItemUseOptions): void;

	/**
	 * Called when the item has stopped being used.
	 * @param options The options of the item use.
	 */
	public onStopUse?(options: ItemUseOptions): void;

	/**
	 * Called when the item has been used.
	 * @param options The options of the item use.
	 * @returns If the item was successfully used, this will cause the event to be done using the item.
	 */
	public onUse?(options: ItemUseOptions): ItemUseMethod | undefined;

	/**
	 * Serializes the item component into the NBT.
	 * @param nbt The NBT to serialize the component to.
	 * @param component The component to serialize.
	 */
	public static serialize<T extends keyof Items>(
		_nbt: CompoundTag,
		_component: ItemComponent<T>
	): void {
		return;
	}

	/**
	 * Deserializes the item component from the NBT.
	 * @param nbt The NBT to deserialize the component from.
	 * @param itemStack The item stack to deserialize the component to.
	 * @returns A new item component.
	 */
	public static deserialize<T extends keyof Items>(
		_nbt: CompoundTag,
		_itemStack: ItemStack<T>
	): ItemComponent<T> {
		return new this(_itemStack, this.identifier);
	}
}

export { ItemComponent };
