import { BLOCK_TYPES, BLOCK_PERMUTATIONS } from "@serenityjs/data";

import { BlockType } from "./type";
import { BlockPermutation } from "./permutation";

import type { BlockIdentifier } from "./enums";

// Iterate over the block types and register them.
for (const type of BLOCK_TYPES) {
	// Check if the block type is already registered.
	if (BlockType.types.has(type.identifier as BlockIdentifier)) {
		throw new Error(`Block type ${type.identifier} is already registered`);
	}

	// Register the block type.
	const instance = new BlockType(
		type.identifier as BlockIdentifier,
		type.loggable,
		type.air,
		type.liquid,
		type.solid,
		type.components,
		type.tags
	);

	// Set the block type in the registry.
	BlockType.types.set(type.identifier as BlockIdentifier, instance);
}

// Iterate over the block permutations and register them.
for (const permutation of BLOCK_PERMUTATIONS) {
	// Get the block type from the registry.
	const type = BlockType.types.get(permutation.identifier as BlockIdentifier);

	// Check if the block type exists.
	if (!type) {
		throw new Error(`Block type ${permutation.identifier} does not exist`);
	}

	// Create a new block permutation.
	const instance = new BlockPermutation(
		permutation.hash,
		permutation.state as never,
		type
	);

	// Register the block permutation.
	type.permutations.push(instance);

	// Register the block permutation in the registry.
	BlockPermutation.permutations.set(permutation.hash, instance);
}
