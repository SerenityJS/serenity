import type { Buffer } from 'node:buffer';
import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT, NBTTag } from '@serenityjs/nbt';
import type { MappedBlock, RawBlock } from '../../../types/index.js';
import type { World } from '../../World.js';
import { BlockBehavior } from './Behavior.js';
import { BlockPermutation } from './Permutation.js';
import { BlockType } from './Type.js';

/**
 * The block mapper class.
 */
class BlockMapper {
	/**
	 * The mapped blocks.
	 */
	protected readonly blocks: Map<string, MappedBlock> = new Map();

	/**
	 * The block behaviors.
	 */
	protected readonly behaviors: Map<string, typeof BlockBehavior> = new Map();

	/**
	 * The world instance.
	 */
	protected readonly world: World;

	/**
	 * The runtime ID.
	 */
	protected RUNTIME_ID = 0;

	/**
	 * Constructs a new block mapper.
	 *
	 * @param world - The world instance.
	 * @param states - The block states.
	 */
	public constructor(world: World, states?: Buffer) {
		// Assign the world.
		this.world = world;

		// Create a new BinaryStream from the states buffer.
		const stream = new BinaryStream(states ?? CANONICAL_BLOCK_STATES);

		// Check if the first tag is a compound tag.
		if (stream.binary[stream.offset] !== NBTTag.Compoud) return;

		// Decode the NBT data.
		do {
			// Read the root tag.
			const data = LightNBT.ReadRootTag(stream) as RawBlock;

			// Assign a runtime ID.
			const runtimeId = this.RUNTIME_ID++;

			// Format the states.
			const states: Record<string, number | string> = {};
			for (const key in data.states) {
				if (!key.startsWith('__')) {
					states[key] = data.states[key].valueOf();
				}
			}

			// Check if the block exists.
			if (!this.blocks.has(data.name)) {
				this.blocks.set(data.name, {
					identifier: data.name,
					permutations: [],
					version: data.version.valueOf(),
				});
			}

			// Get the block.
			const block = this.blocks.get(data.name)!;

			// Push the permutation.
			block.permutations.push({
				runtimeId,
				states,
			});

			// Update the block.
			this.blocks.set(data.name, block);

			// Prepare the block types and permutations.
			const types: BlockType[] = [];
			const permutations: BlockPermutation[] = [];

			// Loop and create the block types.
			for (const [identifier, block] of this.blocks.entries()) {
				// Create a new behavior for the block type.
				const behavior = new (this.behaviors.get(identifier) ?? BlockBehavior)();

				// Create a new block type.
				const type = new BlockType(block.version, identifier, behavior);

				// Loop through the permutations.
				for (const permutation of block.permutations) {
					// Create a new block permutation.
					const mappedPermutation = new BlockPermutation(type, permutation.runtimeId, permutation.states);

					// Add the permutation to the block type.
					type.permutations.push(mappedPermutation);
					permutations.push(mappedPermutation);
				}

				// Push the block type.
				types.push(type);
			}

			// Assign the types and permutations.
			BlockType.types = types;
			BlockPermutation.permutations = permutations;
		} while (!stream.cursorAtEnd());

		// Log the block types and permutations.
		this.world.logger.debug(
			`Fully mapped ${BlockType.types.length} block types, and ${BlockPermutation.permutations.length} block permutations!`,
		);
	}

	/**
	 * Registers a block behavior.
	 *
	 * @param identifier - The block identifier.
	 * @param behavior - The block behavior.
	 */
	public registerBehavior(identifier: string, behavior: typeof BlockBehavior): void {
		// Set the behavior.
		this.behaviors.set(identifier, behavior);

		// Get the block type.
		const type = BlockType.resolve(identifier);

		// Check if the type is null.
		if (!type) return;

		// Set the behavior.
		const instance = new behavior();

		// Set the behavior.
		type.behavior = instance;
	}

	/**
	 * Resolves a block permutation.
	 *
	 * @param identifier - The block identifier.
	 * @param states - The block states.
	 * @returns Returns the block permutation.
	 */
	public resolvePermutation(identifier: string, states?: Record<string, number | string>): BlockPermutation {
		return BlockPermutation.resolve(identifier, states);
	}

	/**
	 * Resolves a block permutation.
	 *
	 * @param runtimeId - The runtime ID.
	 * @returns Returns the block permutation.
	 */
	public resolvePermutationByRuntimeId(runtimeId: number): BlockPermutation {
		return BlockPermutation.resolveByRuntimeId(runtimeId);
	}

	/**
	 * Resolves a block type.
	 *
	 * @param identifier - The block identifier.
	 * @returns Returns the block type.
	 */
	public resolveType(identifier: string): BlockType {
		return BlockType.resolve(identifier);
	}
}

export { BlockMapper };
