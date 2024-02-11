import { BlockType } from './Type';

/**
 * Represents a block permutation.
 */
class BlockPermutation {
	public static permutations: BlockPermutation[] = [];

	/**
	 * The runtime ID of the permutation.
	 */
	protected readonly runtimeId: number;
	/**
	 * The block states.
	 */
	protected readonly states: Record<string, number | string>;

	/**
	 * The block type.
	 */
	public readonly type: BlockType;

	/**
	 * Creates a new block permutation instance.
	 *
	 * @param type The block type.
	 * @param runtimeId The runtime ID.
	 * @param states The block states.
	 */
	public constructor(type: BlockType, runtimeId: number, states: Record<string, number | string>) {
		this.type = type;
		this.runtimeId = runtimeId;
		this.states = states;
	}

	/**
	 * Gets the runtime ID of the permutation.
	 *
	 * @returns Returns the runtime ID.
	 */
	public getRuntimeId(): number {
		return this.runtimeId;
	}

	/**
	 * Checks whether the permutation matches the given identifier and states.
	 *
	 * @param identifier The block identifier.
	 * @param states The block states.
	 * @returns Returns true when the permutation matches, false otherwise.
	 */
	public matches(identifier: string, states?: Record<string, number | string>): boolean {
		// Check if the identifier matches.
		if (this.type.identifier !== identifier) return false;

		// Check if the states match.
		if (!states) return true;

		// Find the permutation.
		const permutation = BlockPermutation.permutations.find(
			(permutation) => JSON.stringify(permutation.states) === JSON.stringify(states),
		);

		// Return the permutation.
		return permutation !== undefined;
	}

	/**
	 * Resolves a block permutation.
	 *
	 * @param identifier The block identifier.
	 * @param states The block states.
	 * @returns Returns the block permutation.
	 */
	public static resolve(identifier: string, states?: Record<string, number | string>): BlockPermutation {
		// Find the block type.
		const type = BlockType.resolve(identifier);

		// Find the permutation.
		const permutation = BlockPermutation.permutations.find(
			(permutation) => permutation.type === type && JSON.stringify(permutation.states) === JSON.stringify(states),
		);

		// Return the permutation.
		return permutation ?? type.getDefaultPermutation();
	}

	/**
	 * Resolves a block permutation.
	 *
	 * @param runtimeId The runtime ID.
	 * @returns Returns the block permutation.
	 */
	public static resolveByRuntimeId(runtimeId: number): BlockPermutation {
		// Find the permutation.
		const permutation = BlockPermutation.permutations.find((permutation) => permutation.runtimeId === runtimeId);

		// Return the permutation.
		return permutation!;
	}
}

export { BlockPermutation };
