import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { BlockIdentifier } from "../enums";
import { BlockState } from "../types";
import { getHash } from "../utils";

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
	public constructor(type: BlockType, states: T, hash: number) {
		this.type = type;
		this.runtime = BlockPermutation.runtime++;
		this.states = states;
		this.hash = hash;
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

	/**
	 * Registers a new block permutation.
	 * @param type The block type of the permutation.
	 * @returns The block permutation.
	 */
	public static register(type: BlockType): BlockPermutation {
		// Create a new nbt stream.
		const stream = new BinaryStream();

		// Create the root compound tag.
		const root = new CompoundTag("", {});

		// Write the name of the block type, and the states.
		root.addTag(new StringTag("name", type.identifier));
		root.addTag(new CompoundTag("states", {}));

		// Write the root tag to the stream.
		CompoundTag.write(stream, root);

		// Caluclate the hash of the permutation.
		const hash = getHash(stream.getBuffer());

		// Create a new permutation.
		const permutation = new BlockPermutation(type, {}, hash);

		// Push the permutation to the block type.
		type.permutations.push(permutation);

		// Add the permutation to the collective map.
		this.permutations.set(permutation.runtime, permutation);

		// Return the permutation.
		return permutation;
	}
}

export { BlockPermutation };
