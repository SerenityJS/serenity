import { ItemType } from "@serenityjs/item";

import type {
	NetworkItemInstanceDescriptor,
	NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import type { Items } from "@serenityjs/item";
import type { Container } from "../container";

class ItemStack<T extends keyof Items = keyof Items> {
	public readonly type: ItemType<T>;

	public readonly metadata: number;

	protected _amount: number;

	public container: Container | null = null;

	public constructor(identifier: T, amount: number, metadata: number) {
		this.type = ItemType.get(identifier) as ItemType<T>;
		this._amount = amount;
		this.metadata = metadata;
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

		// Return the item instance descriptor.
		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			blockRuntimeId: permutation?.network ?? 0,
			extras: null // TODO: Implement extras
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
