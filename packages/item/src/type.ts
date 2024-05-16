import { type BlockIdentifier, BlockType } from "@serenityjs/block";

import type { Items } from "./types";

class ItemType<T extends keyof Items = keyof Items> {
	/**
	 * A collective registry of all item types.
	 */
	public static readonly types = new Map<string, ItemType>();

	/**
	 * The identifier of the item type.
	 */
	public readonly identifier: T;

	/**
	 * The network of the item type.
	 */
	public readonly network: number;

	/**
	 * The block of the item type, if acclicable.
	 */
	public readonly block: Items[T];

	/**
	 * Create a new item type.
	 * @param identifier The identifier of the item type.
	 * @param network The network of the item type.
	 */
	public constructor(identifier: T, network: number, block?: Items[T]) {
		this.identifier = identifier;
		this.network = network;
		this.block =
			block ??
			(BlockType.get(identifier as unknown as BlockIdentifier) as Items[T]);
	}

	/**
	 * Get the item type from the registry.
	 */
	public static get<T extends keyof Items>(identifier: T): ItemType<T> | null {
		return ItemType.types.get(identifier) as ItemType<T>;
	}

	/**
	 * Get the item type from the network.
	 * @param network The network to get the item type from.
	 */
	public static getByNetwork(network: number): ItemType | null {
		return (
			[...ItemType.types.values()].find((item) => item.network === network) ??
			null
		);
	}

	/**
	 * Get all item types from the registry.
	 */
	public static getAll(): Array<ItemType> {
		return [...ItemType.types.values()];
	}

	/**
	 * Resolve the item type from the block type.
	 * @param type The block type to resolve.
	 */
	public static resolve(type: BlockType): ItemType | null {
		return (
			[...ItemType.types.values()].find((item) => item.block === type) ?? null
		);
	}
}

export { ItemType };
