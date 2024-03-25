import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";
import { BinaryStream } from "@serenityjs/binaryutils";
import { CANONICAL_BLOCK_STATES } from "@serenityjs/data";

import { BlockStateNBT, BlockState } from "../types";
import { BlockIdentifier } from "../enums";
import { getHash } from "../utils";

import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";
import { CustomBlockType } from "./custom";

type BlockNbt = CompoundTag<{
	name: StringTag;
	states: BlockStateNBT;
	version: IntTag;
}>;

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
			const nbt = CompoundTag.read<BlockNbt>(stream, true, true);

			// Get the block name from the NBT data.
			const name = nbt.getTag("name")?.valueOf() as BlockIdentifier;

			// Get the block states from the NBT data.
			const states = nbt.getTag("states")?.valueOf() as BlockStateNBT;

			// Get the version from the NBT data.
			const version = nbt.getTag("version")?.valueOf() as number;

			// Create the hash key.
			// The hash key consists of the block type name and states.
			// So we need to remove the version tag from the NBT data.
			const key = nbt.removeTag("version");

			// Create and write the states to a new stream.
			const hasher = new BinaryStream();
			CompoundTag.write(hasher, key);

			// Calculate the hash from the stream.
			const hash = getHash(hasher.getBuffer());

			// Check if the block state is already in the map.
			if (BlockType.types.has(name)) {
				// Get the block type from the map.
				const type = BlockType.types.get(name)!;

				// Create a new permutation.
				const permutation = new BlockPermutation(
					type,
					states.valueOf() as BlockState,
					hash
				);

				// Push the permutation to the block type.
				type.permutations.push(permutation);

				// Add the permutation to the collective map.
				BlockPermutation.permutations.set(permutation.runtime, permutation);
			} else {
				// Create a new block type.
				const type = new BlockType(name, version);

				// Create a new permutation.
				const permutation = new BlockPermutation(
					type,
					states.valueOf() as BlockState,
					hash
				);

				// Push the permutation to the block type.
				type.permutations.push(permutation);

				// Add the type to the collective map.
				BlockType.types.set(name, type);

				// Add the permutation to the collective map.
				BlockPermutation.permutations.set(permutation.runtime, permutation);
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
		return BlockPermutation.resolveByRuntime(identifier);
	}

	/**
	 * Gets all the custom blocks registered.
	 * @returns The custom blocks.
	 */
	public getCustomBlocks(): Array<CustomBlockType> {
		return [...BlockType.types.values()].filter(
			(type) => type instanceof CustomBlockType
		) as Array<CustomBlockType>;
	}
}

export { BlockRegistry };
