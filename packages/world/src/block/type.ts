import { BlockIdentifier } from "../enums";
import { BlockState, CanonicalState } from "../types";

import { BlockPermutation } from "./permutation";

/**
 * A block type.
 */
class BlockType {
	/**
	 * A collective map of all block types registered.
	 */
	public static types: Map<string, BlockType> = new Map();

	/**
	 * The version of the block state.
	 */
	public readonly version: number;

	/**
	 * The identifier of the block state.
	 */
	public readonly identifier: BlockIdentifier;

	/**
	 * The permutations of the block state.
	 */
	public readonly permutations: Array<BlockPermutation>;

	/**
	 * Creates a new block type.
	 * @param state The block state to create the type from.
	 */
	public constructor(state: CanonicalState) {
		this.version = state.version;
		this.identifier = state.name;
		this.permutations = [];
	}

	/**
	 * Gets a permutation of the block type.
	 * If no states are provided, the default permutation is returned.
	 * @param states The states of the permutation.
	 * @returns The permutation.
	 */
	public getPermutation<T = BlockState>(states?: T): BlockPermutation<T> {
		return states
			? BlockPermutation.resolve<T>(this.identifier, states)
			: (this.permutations[0] as BlockPermutation<T>);
	}

	/**
	 * Resolves a block type from the identifier.
	 * @param identifier The identifier of the block type.
	 * @returns The block type.
	 */
	public static resolve(identifier: BlockIdentifier): BlockType {
		return this.types.get(identifier)!;
	}
}

export { BlockType };
