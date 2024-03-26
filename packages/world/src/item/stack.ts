import { NetworkItemStackDescriptor } from "@serenityjs/protocol";

import { ItemIdentifier } from "../enums";
import { Container } from "../container";

import { ItemType } from "./type";

class ItemStack {
	public readonly type: ItemType;

	public readonly metadata: number;

	protected _amount: number;

	public container: Container | null = null;

	public constructor(
		identifier: ItemIdentifier,
		amount: number,
		metadata: number
	) {
		this.type = ItemType.resolve(identifier);
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

	public static toDescriptor(item: ItemStack): NetworkItemStackDescriptor {
		// Get the block permutation of the item.
		const block = item.type.block?.getPermutation();

		// Return the item descriptor.
		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: item.metadata,
			stackNetId: null,
			blockRuntimeId: block?.hash ?? 0,
			extras: null // TODO: Implement extras
		};
	}
}

export { ItemStack };
