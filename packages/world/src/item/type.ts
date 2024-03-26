import { BlockType } from "../block";
import { ItemIdentifier } from "../enums";

import { ItemStack } from "./stack";

/**
 * An item type.
 */
class ItemType {
	/**
	 * A collective map of all item types registered.
	 */
	public static types: Map<string, ItemType> = new Map();

	/**
	 * The identifier of the item type.
	 */
	public readonly identifier: ItemIdentifier;

	/**
	 * The network identifier of the item type.
	 */
	public readonly network: number;

	/**
	 * The valid metadata values of the item type.
	 */
	public readonly metadata: Array<number>;

	/**
	 * The block permutation of the item type.
	 */
	public block: BlockType | null = null;

	/**
	 * Creates a new item type.
	 * @param identifier The identifier of the item type.
	 * @param legacy The legacy identifier of the item type.
	 * @param network The network identifier of the item type.
	 * @param metadata The valid metadata values of the item type.
	 */
	public constructor(
		identifier: ItemIdentifier,
		network: number,
		metadata?: Array<number>
	) {
		this.identifier = identifier;
		this.network = network;
		this.metadata = metadata ?? [0];
	}

	public create(amount: number, metadata: number): ItemStack {
		return new ItemStack(this.identifier, amount, metadata);
	}

	public static resolve(identifier: ItemIdentifier): ItemType {
		return ItemType.types.get(identifier)!;
	}

	public static resolveByNetwork(network: number): ItemType {
		for (const [_, type] of ItemType.types) {
			if (type.network === network) return type;
		}

		return ItemType.types.get("minecraft:air")!;
	}
}

export { ItemType };
