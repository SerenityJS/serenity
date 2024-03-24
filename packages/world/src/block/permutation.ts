import { CompoundTag, StringTag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binaryutils";

import { BlockIdentifier } from "../enums";
import { BlockState, BlockStateNBT } from "../types";

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
	 * The runtime counter for permutations.
	 */
	public static runtime: number = 0;

	/**
	 * The runtime of the permutation.
	 */
	public readonly runtime: number;

	/**
	 * The hash of the permutation.
	 */
	public readonly hash: number;

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
	public constructor(type: BlockType, states: BlockStateNBT) {
		this.type = type;
		this.runtime = BlockPermutation.runtime++;
		this.hash = BlockPermutation.getHash(type.identifier, states);
		this.states = states.valueOf<T>() as T;
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
	 * Gets the hash of the permutation.
	 * @param identifier The identifier of the block type.
	 * @param states The states of the block type.
	 * @returns The hash of the permutation.
	 */
	public static getHash(
		identifier: BlockIdentifier,
		states: BlockStateNBT
	): number {
		// Create a new compound tag.
		const tag = new CompoundTag("", {});

		// Add the name to the tag.
		tag.addTag(new StringTag("name", identifier));

		// Add the states to the tag.
		tag.addTag(states);

		// Create a new binary stream.
		const stream = new BinaryStream();

		// Write the tag to the stream.
		CompoundTag.write(stream, tag);

		// Assign the offset to the hash.
		const offset = 0x81_1c_9d_c5;

		// Assign the hash to the offset.
		let hash = offset;

		// Loop through each element in the buffer.
		for (const element of stream.getBuffer()) {
			hash ^= element;
			hash +=
				(hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
		}

		// Return the hash.
		return hash;
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
	 * Resolves a block permutation from the runtime identifier.
	 * @param runtime The runtime identifier of the block type.
	 * @returns The block permutation.
	 */
	public static resolveByRuntime<T = BlockState>(
		runtime: number
	): BlockPermutation<T> {
		return this.permutations.get(runtime) as BlockPermutation<T>;
	}

	/**
	 * Resolves a block permutation from the hash value.
	 * @param hash The hash value of the block type.
	 * @returns The block permutation.
	 */
	public static resolveByHash<T = BlockState>(
		hash: number
	): BlockPermutation<T> {
		return [...this.permutations.values()].find(
			(permutation) => permutation.hash === hash
		) as BlockPermutation<T>;
	}
}

export { BlockPermutation };
