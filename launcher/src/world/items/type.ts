import type { BlockPermutation } from "../chunk";

/**
 * Represents a type of item.
 */
class ItemType {
	/**
	 * A list of all item types.
	 */
	public static types: Array<ItemType> = [];

	/**
	 * The item type identifier.
	 */
	public readonly identifier: string;

	/**
	 * The item type metadata.
	 */
	public readonly metadata: number;

	/**
	 * The item type runtime ID.
	 */
	public readonly runtimeId: number;

	/**
	 * The item type network ID.
	 */
	public readonly networkId: number;

	/**
	 * The item type block permutation.
	 */
	public readonly permutation: BlockPermutation | null;

	/**
	 * Constructs a new item type.
	 *
	 * @param identifier - The item type identifier.
	 * @param metadata - The item type metadata.
	 * @param runtimeId - The item type runtime ID.
	 * @param networkId - The item type network ID.
	 * @param permutation - The item type block permutation.
	 */
	public constructor(
		identifier: string,
		metadata: number,
		runtimeId: number,
		networkId: number,
		permutation?: BlockPermutation
	) {
		this.identifier = identifier;
		this.metadata = metadata;
		this.runtimeId = runtimeId;
		this.networkId = networkId;
		this.permutation = permutation ?? null;
	}

	/**
	 * Resolves an item type.
	 *
	 * @param identifier - The item type identifier.
	 * @param metadata - The item type metadata.
	 * @returns Returns the item type.
	 */
	public static resolve(identifier: string, metadata = 0): ItemType | null {
		// Find the type.
		const type = ItemType.types.find(
			(x) => x.identifier === identifier && x.metadata === metadata
		);

		// Return null if the type is null.
		if (!type) return null;

		// Return the type.
		return type;
	}

	public static resolveByRuntimeId(runtimeId: number): ItemType | null {
		// Find the type.
		const type = ItemType.types.find((x) => x.runtimeId === runtimeId);

		// Return null if the type is null.
		if (!type) return null;

		// Return the type.
		return type;
	}
}

export { ItemType };
