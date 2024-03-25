import { BlockPermutation } from "../block";
import { ItemIdentifier } from "../enums";

/**
 * An item type.
 */
class ItemType {
	/**
	 * A collective map of all item types registered.
	 */
	public static types: Map<string, ItemType> = new Map();

	/**
	 * The runtime counter for item types.
	 */
	public static runtime: number = 0;

	/**
	 * The runtime identifer of the item type.
	 */
	public readonly runtime: number;

	/**
	 * The network identifier of the item type.
	 */
	public readonly network: number;

	/**
	 * The identifier of the item type.
	 */
	public readonly identifier: ItemIdentifier;

	/**
	 * The block permutations of the item type, if applicable.
	 */
	public readonly permutations: Array<BlockPermutation | null>;

	/**
	 * Creates a new item type.
	 * @param identifier The identifier of the item type.
	 * @param network The network identifier of the item type.
	 * @param permutation The block permutation of the item type.
	 */
	public constructor(
		identifier: ItemIdentifier,
		network: number,
		permutations: Array<BlockPermutation | null>
	) {
		this.runtime = ItemType.runtime++;
		this.identifier = identifier;
		this.network = network;
		this.permutations = permutations;
	}

	public static resolve(identifier: ItemIdentifier): ItemType {
		return ItemType.types.get(identifier)!;
	}

	public static resolveByRuntime(runtime: number): ItemType {
		for (const [_, type] of ItemType.types) {
			if (type.runtime === runtime) return type;
		}

		return ItemType.types.get("minecraft:air")!;
	}

	public static resolveByNetwork(network: number): ItemType {
		for (const [_, type] of ItemType.types) {
			if (type.network === network) return type;
		}

		return ItemType.types.get("minecraft:air")!;
	}
}

export { ItemType };
