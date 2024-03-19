import { BlockIdentifier } from "../enums";
import { BlockState } from "../types";

import { BlockType } from "./type";

/**
 * A block permutation.
 */
class BlockPermutation<T = BlockState> {
	/**
	 * A collective map of all block permutations registered.
	 */
	public static permutations: Map<number, BlockPermutation> = new Map();

	/**
	 * The identifier counter for permutations.
	 */
	public static identifier: number = 0;

	/**
	 * The identifier of the permutation.
	 */
	public readonly identifier: number;

	/**
	 * The states of the permutation.
	 */
	public readonly states: T;

	/**
	 * The block type of the permutation.
	 */
	public readonly type: BlockType;

	/**
	 * Creates a new block permutation.
	 * @param type The block type of the permutation.
	 * @param states The states of the permutation.
	 */
	public constructor(type: BlockType, states: T) {
		this.type = type;
		this.identifier = BlockPermutation.identifier++;
		this.states = states;
	}

	/**
	 * Checks if the permutation matches the identifier and states.
	 * @param identifier The identifier to check.
	 * @param states The states to check.
	 * @returns Whether or not the permutation matches.
	 */
	public matches<T>(identifier: string, states: T): boolean {
		// Check if the identifier matches.
		if (this.type.identifier !== identifier) return false;

		// Check if the states match.
		if (!states) return true;

		// Find the permutation.
		const permutation = this.type.permutations.find(
			(permutation) =>
				JSON.stringify(permutation.states) === JSON.stringify(states)
		);

		// Return the permutation.
		return permutation !== undefined;
	}

	/**
	 * Resolves a block permutation from the identifier and states.
	 * @param identifier The identifier of the block type.
	 * @param states The states of the block type.
	 * @returns The block permutation.
	 */
	public static resolve<T = BlockState>(
		identifier: BlockIdentifier,
		states?: T
	): BlockPermutation<T> {
		// Find the block type from the identifier.
		const type = BlockType.resolve(identifier);

		// Find the permutation from the states.
		const permutation = type.permutations.find(
			(permutation) =>
				permutation.type === type &&
				JSON.stringify(permutation.states) === JSON.stringify(states)
		);

		// Return the permutation.
		return (permutation ?? type.permutations[0]) as BlockPermutation<T>;
	}

	/**
	 * Resolves a block permutation from the identifier.
	 * @param identifier The identifier of the block type.
	 * @returns The block permutation.
	 */
	public static resolveByIdentifier<T = BlockState>(
		identifier: number
	): BlockPermutation<T> {
		return this.permutations.get(identifier) as BlockPermutation<T>;
	}
}

export { BlockPermutation };
