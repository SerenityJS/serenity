import { CompoundTag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binaryutils";
import { CANONICAL_BLOCK_STATES } from "@serenityjs/bedrock-data";

import { CanonicalStateNBT, CanonicalState, BlockState } from "../types";
import { BlockIdentifier } from "../enums";

import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";

/**
 * A block registry.
 */
class BlockRegistry {
	/**
	 * Creates a new block registry.
	 */
	public constructor() {
		// Create a new stream from the canonical block states.
		const stream = new BinaryStream(CANONICAL_BLOCK_STATES);

		// Decode the NBT data from the stream.
		do {
			// Each block state is stored as a compound tag.
			// So we can just read the next compound tag from the stream.
			const nbt = CompoundTag.read<CanonicalStateNBT>(stream, true, true);

			// Convert the NBT data to a block state object.
			const block = nbt.valueOf<CanonicalState>() as CanonicalState;

			// Check if the block state is already in the map.
			if (BlockType.types.has(block.name)) {
				// Get the block type from the map.
				const type = BlockType.types.get(block.name)!;

				// Create a new permutation.
				const permutation = new BlockPermutation(type, block.states);

				// Push the permutation to the block type.
				type.permutations.push(permutation);

				// Add the permutation to the collective map.
				BlockPermutation.permutations.set(permutation.identifier, permutation);
			} else {
				// Create a new block type.
				const type = new BlockType(block);

				// Create a new permutation.
				const permutation = new BlockPermutation(type, block.states);

				// Push the permutation to the block type.
				type.permutations.push(permutation);

				// Add the type to the collective map.
				BlockType.types.set(block.name, type);

				// Add the permutation to the collective map.
				BlockPermutation.permutations.set(permutation.identifier, permutation);
			}
		} while (!stream.cursorAtEnd());
	}

	/**
	 * Resolves a block type from the identifier.
	 * @param identifier The identifier of the block type.
	 * @returns The block type.
	 */
	public resolveType(identifier: BlockIdentifier): BlockType {
		return BlockType.resolve(identifier);
	}

	/**
	 * Resolves a block permutation from the identifier and states.
	 * @param identifier The identifier of the block type.
	 * @param states The states of the permutation.
	 * @returns The block permutation.
	 */
	public resolvePermutation<T = BlockState>(
		identifier: BlockIdentifier,
		states?: T
	): BlockPermutation<T> {
		return BlockPermutation.resolve(identifier, states);
	}

	/**
	 * Resolves a block permutation from the identifier.
	 * @param identifier The identifier of the block type.
	 * @returns The block permutation.
	 */
	public resolvePermutationByIdentifier<T = BlockState>(
		identifier: number
	): BlockPermutation<T> {
		return BlockPermutation.resolveByIdentifier(identifier);
	}
}

export { BlockRegistry };
