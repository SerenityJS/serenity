import { BlockPermutation } from "./permutation";

import type { BlockBehavior } from "./behavior";

class BlockType {
	/**
	 * The block types.
	 */
	public static types: Array<BlockType> = [];

	/**
	 * The block version.
	 */
	public readonly version: number;

	/**
	 * The block identifier.
	 */
	public readonly identifier: string;

	/**
	 * The block permutations.
	 */
	public readonly permutations: Array<BlockPermutation>;

	/**
	 * The block behavior.
	 */
	public behavior: BlockBehavior;

	/**
	 * Creates a new block type instance.
	 *
	 * @param version The block version.
	 * @param identifier The block identifier.
	 */
	public constructor(
		version: number,
		identifier: string,
		behavior: BlockBehavior
	) {
		this.version = version;
		this.identifier = identifier;
		this.permutations = [];
		this.behavior = behavior;
	}

	/**
	 * Gets the block permutations. If states are not provided, the default permutation is returned.
	 *
	 * @returns Returns the block permutations.
	 */
	public getPermutation(
		states?: Record<string, number | string>
	): BlockPermutation {
		return states
			? BlockPermutation.resolve(this.identifier, states)!
			: this.permutations[0]!;
	}

	/**
	 * Resolves a block type.
	 *
	 * @param identifier The block identifier.
	 * @returns Returns the block type.
	 */
	public static resolve(identifier: string): BlockType {
		return this.types.find((type) => type.identifier === identifier)!;
	}
}

export { BlockType };
