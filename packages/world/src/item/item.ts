import { NetworkItemStackDescriptor } from "@serenityjs/protocol";

import { ItemIdentifier } from "../enums";
import { Container } from "../container";

import { ItemType } from "./type";

class Item {
	public readonly type: ItemType;

	public readonly container: Container;

	protected _amount: number;

	public constructor(
		identifier: ItemIdentifier,
		amount: number,
		container: Container
	) {
		this.type = ItemType.resolve(identifier);
		this._amount = amount;
		this.container = container;
	}

	public get amount(): number {
		return this._amount;
	}

	public set amount(value: number) {
		// Set the amount of the item.
		this._amount = value;

		// Get the slot of the item in the container.
		const slot = this.container.storage.indexOf(this);

		// Set the item in the container.
		this.container.setItem(slot, this);
	}

	public static toItemStack(item: Item): NetworkItemStackDescriptor {
		// Get the block permutation of the item.
		const block = item.type.block?.getPermutation();

		return {
			network: item.type.network,
			stackSize: item.amount,
			metadata: 0, // TODO: Implement metadata
			stackNetId: null,
			blockRuntimeId: block?.hash ?? 0,
			extras: null // TODO: Implement extras
		};
	}
}

export { Item };
