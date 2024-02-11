import type { Buffer } from 'node:buffer';
import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT, NBTTag } from '@serenityjs/nbt';
import type { Logger } from '../../../console';
import type { MappedBlock, RawBlock } from '../../../types';
import { BlockPermutation } from './Permutation';
import { BlockType } from './Type';

class BlockMapper {
	/**
	 * The mapped blocks.
	 */
	protected readonly blocks: Map<string, MappedBlock> = new Map();

	/**
	 * The logger.
	 */
	protected readonly logger: Logger;

	/**
	 * The runtime ID.
	 */
	protected RUNTIME_ID = 0;

	public constructor(logger: Logger, states?: Buffer) {
		// Set the logger.
		this.logger = logger;

		// Create a new BinaryStream from the states buffer.
		const stream = new BinaryStream(states ?? CANONICAL_BLOCK_STATES);

		// Check if the first tag is a compound tag.
		if (stream.binary[stream.offset] !== NBTTag.Compoud) return;

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
				// Create a new block type.
				const type = new BlockType(block.version, identifier);

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

			BlockType.types = types;
			BlockPermutation.permutations = permutations;
		} while (!stream.cursorAtEnd());

		this.logger.debug(
			`Fully mapped ${BlockType.types.length} block types, and ${BlockPermutation.permutations.length} block permutations!`,
		);
	}
}

export { BlockMapper };
