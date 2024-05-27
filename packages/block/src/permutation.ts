import { BlockType } from "./type";
import { BlockState } from "./types";
import { hash } from "./hash";

import type { BlockIdentifier } from "./enums";

/**
 * BlockPermutation represents a current state of a block, for example dirt has a single state "dirt_type". This state can be changed to "coarse" or "normal" to represent a different state of dirt. This means dirt has a total of 2 permutations, one for "coarse" and one for "normal".
 * 
 * **Example Usage**
 * ```typescript
	import { BlockPermutation, BlockIdentifier } from "@serenityjs/block"

	// Get the block permutation for coarse dirt
	const coarseDirtPermutation = BlockPermutation.resolve(BlockIdentifier.Dirt, { dirt_type: "coarse" })

	// Get the block type for coarse dirt permutation
	// Which is expected to be "minecraft:dirt"
	const blockType = coarseDirtPermutation.type // Equivalent to BlockType.get(BlockIdentifier.Dirt)

	// Get the block state for coarse dirt permutation
	coarseDirtPermutation.state // Expected to be { dirt_type: "coarse" }
 * ```
 */
class BlockPermutation<T extends keyof BlockState = keyof BlockState> {
	/**
	 * A collective registry of all block permutations.
	 */
	public static readonly permutations = new Map<number, BlockPermutation>();

	/**
	 * The network hash of the block permutation.
	 */
	public readonly network: number;

	/**
	 * The index value of the block permutation in the block type.
	 */
	public readonly index: number;

	/**
	 * The state of the block permutation.
	 */
	public readonly state: BlockState[T];

	/**
	 * The block type of the block permutation.
	 */
	public readonly type: BlockType<T>;

	/**
	 * Create a new block permutation.
	 * @param network The network hash of the block permutation.
	 * @param state The state of the block permutation.
	 * @param type The block type of the block permutation.
	 */
	public constructor(
		network: number,
		state: BlockState[T],
		type: BlockType<T>
	) {
		this.network = network;
		this.state = state;
		this.type = type;
		this.index = type.permutations.length;
	}

	/**
	 * Check if the block permutation matches the identifier and state.
	 * @param identifier The block identifier to match.
	 * @param state The block state to match.
	 */
	public matches(state: BlockState[T]): boolean {
		// Check if the block state matches.
		for (const key in state) {
			if (this.state[key] !== state[key]) {
				return false;
			}
		}

		// Return true if the block permutation matches.
		return true;
	}

	/**
	 * Resolve a block permutation from the block identifier and state.
	 * @param identifier The block identifier to resolve.
	 * @param state The block state to resolve.
	 */
	public static resolve<T extends keyof BlockState>(
		identifier: T,
		state?: BlockState[T]
	): BlockPermutation<T> {
		// Get the block type from the registry.
		const type = BlockType.types.get(identifier as BlockIdentifier);

		// Check if the block type exists.
		if (!type) {
			throw new Error(`Block type ${identifier} does not exist`);
		}

		// Check if the state is not provided.
		const permutation = type.permutations.find((permutation) => {
			for (const key in state) {
				if ((permutation.state as never)[key] !== state[key]) {
					return false;
				}
			}

			// Return true if the block permutation matches.
			return true;
		});

		// Check if the block permutation does not exist.
		if (!permutation) {
			// Return the default permutation if the state is not found.
			return type.permutations[0] as BlockPermutation<T>;
		}

		// Return the block permutation.
		return permutation as BlockPermutation<T>;
	}

	/**
	 * Create a new block permutation.
	 * Primarily used for custom block types.
	 * @param type The block type of the block permutation.
	 * @param state The state of the block permutation.
	 */
	public static create(
		type: BlockType,
		state?: Record<string, string | number | boolean>
	): BlockPermutation {
		// Calculate the network hash of the block permutation.
		const network = hash(type.identifier, state ?? {});

		// Create a new block permutation.
		const permutation = new BlockPermutation(network, state ?? {}, type);

		// Register the block permutation.
		BlockPermutation.permutations.set(permutation.network, permutation);

		// Return the block permutation.
		return permutation;
	}
}

export { BlockPermutation };
