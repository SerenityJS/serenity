import { ItemType } from "@serenityjs/item";
import { CompoundTag, StringTag } from "@serenityjs/nbt";

import type { ItemComponents } from "../types";
import type { ItemComponent } from "../components";
import type {
	NetworkItemInstanceDescriptor,
	NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import type { Items } from "@serenityjs/item";
import type { Container } from "../container";

class ItemStack<T extends keyof Items = keyof Items> {
	/**
	 * The item type of the item stack.
	 */
	public readonly type: ItemType<T>;

	/**
	 * The metadata value of the item stack.
	 */
	public readonly metadata: number;

	public readonly components: Map<string, ItemComponent>;

	protected _amount: number;

	public container: Container | null = null;

	public constructor(identifier: T, amount: number, metadata: number) {
		this.type = ItemType.get(identifier) as ItemType<T>;
		this.metadata = metadata;
		this.components = new Map();
		this._amount = amount;
	}

	public get amount(): number {
		return this._amount;
	}

	public set amount(value: number) {
		// Set the amount of the item.
		this._amount = value;

		// Check if the item is in a container.
		if (!this.container) return;

		// Get the slot of the item in the container.
		const slot = this.container.storage.indexOf(this);

		// Set the item in the container.
		this.container.setItem(slot, this);
	}

	/**
	 * Gets a component from the item.
	 * @param identifier The identifier of the component.
	 * @returns The component that was found.
	 */
	public getComponent<T extends keyof ItemComponents>(
		identifier: T
	): ItemComponents[T] {
		return this.components.get(identifier) as ItemComponents[T];
	}

	/**
	 * Gets all the components of the item.
	 * @returns All the components of the item.
	 */
	public getComponents(): Array<ItemComponent> {
		return [...this.components.values()];
	}

	/**
	 * Sets a component to the item.
	 * @param component The component to set.
	 */
	public setComponent<T extends keyof ItemComponents>(
		component: ItemComponents[T]
	): ItemComponents[T] {
		this.components.set(component.identifier, component);

		return component;
	}

	/**
	 * Removes a component from the item.
	 * @param identifier The identifier of the component.
	 */
	public removeComponent<T extends keyof ItemComponents>(identifier: T): void {
		this.components.delete(identifier);
	}

	/**
	 * Converts the item stack to a network item instance descriptor.
	 * Which is used on the protocol level.
	 * @param item The item stack to convert.
	 * @returns The network item instance descriptor.
	 */
	public static toNetworkInstance(
		item: ItemStack
	): NetworkItemInstanceDescriptor {
		// Get the permtuation of the block.
		const permutation = item.type.block?.permutations[item.metadata];

		// Create the NBT tag.
		const nbt = new CompoundTag("", {});

		// Create the display tag.
		const display = new CompoundTag("display", {});

		// Check if the item has a display name.
		if (item.components.has("minecraft:nametag")) {
			// Get the nametag component.
			const nametag = item.getComponent("minecraft:nametag");

			// Create the name tag.
			const name = new StringTag("Name", nametag.currentValue);

			// Set the display name.
			display.addTag(name);
		}

		// Set the display tag.
		nbt.addTag(display);

		// Return the item instance descriptor.
		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			networkBlockId: permutation?.network ?? 0,
			extras: {
				nbt,
				canDestroy: [],
				canPlaceOn: []
			}
		};
	}

	/**
	 * Converts the item stack to a network item stack descriptor.
	 * Which is used on the protocol level.
	 * @param item The item stack to convert.
	 * @returns The network item stack descriptor.
	 */
	public static toNetworkStack(item: ItemStack): NetworkItemStackDescriptor {
		// Get network item instance descriptor.
		const instance = ItemStack.toNetworkInstance(item);

		// Return the item stack descriptor.
		return {
			...instance,
			stackNetId: null // TODO: Implement stackNetId, this is so that the server can track the item stack.
		};
	}

	/**
	 * Creates a new item stack from a provided item type.
	 * @param type The type of the item.
	 * @param amount The amount of the item.
	 * @param metadata The metadata of the item.
	 * @returns The item stack.
	 */
	public static create<T extends keyof Items>(
		type: ItemType<T>,
		amount: number,
		metadata: number
	): ItemStack<T> {
		return new ItemStack(type.identifier, amount, metadata);
	}
}

export { ItemStack };
