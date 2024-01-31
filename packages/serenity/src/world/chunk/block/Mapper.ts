import type { Buffer } from 'node:buffer';
import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT, NBTTag } from '@serenityjs/nbt';
import type { MappedBlock, RawBlock } from '../../../types';
import { BlockPermutation } from './Permutation';
import { BlockType } from './Type';

class BlockMapper {
	protected readonly blocks: Map<string, MappedBlock> = new Map();

	public readonly types: Map<string, BlockType> = new Map();
	public readonly permutations: Map<number, BlockPermutation> = new Map();

	protected readonly AIR_TYPE!: BlockType;

	protected RUNTIME_ID = 0;

	public constructor(states?: Buffer) {
		// Create a new BinaryStream from the states buffer.
		const stream = new BinaryStream(states ?? CANONICAL_BLOCK_STATES);

		// Check if the first tag is a compound tag.
		if (stream.binary[stream.offset] !== NBTTag.Compoud) return;

		do {
			// Read the root tag.
			const data = LightNBT.ReadRootTag(stream) as RawBlock;

			// Assign a runtime ID.
			const runtimeId = this.RUNTIME_ID++;

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
				state: data.states,
			});

			// Update the block.
			this.blocks.set(data.name, block);

			// Loop and create the block types.
			for (const [identifier, block] of this.blocks.entries()) {
				// Create a new block type.
				const type = new BlockType(block.version, identifier);

				// Loop through the permutations.
				for (const permutation of block.permutations) {
					// Create a new block permutation.
					const mappedPermutation = new BlockPermutation(type, permutation.runtimeId, permutation.state);

					// Add the permutation to the block type.
					type.permutations.push(mappedPermutation);
				}

				// Add the block type to the map.
				this.types.set(identifier, type);
			}
		} while (!stream.cursorAtEnd());

		// Loop through the block types.
		for (const type of this.types.values()) {
			// Loop through the permutations.
			for (const permutation of type.permutations) {
				// Add the permutation to the map.
				this.permutations.set(permutation.runtimeId, permutation);
			}
		}

		this.AIR_TYPE = this.types.get('minecraft:air')!;
	}

	public getBlockType(identifier: string): BlockType {
		// Check if the block type exists.
		return this.types.get(identifier) ?? this.AIR_TYPE;
	}

	public getBlockPermutation(identifier: string, state?: Record<string, number | string>): BlockPermutation {
		// Get the block type.
		const type = this.getBlockType(identifier);

		// Check if the block type has any permutations.
		if (type.permutations.length === 0) {
			// Return the default permutation.
			return type.getDefaultPermutation();
		}

		// Find the permutation.
		// Apparently you cant compare objects for equality in JS
		const permutation = type.permutations.find((x) => JSON.stringify(x.value) === JSON.stringify(state));

		// Return the permutation.
		return permutation ?? type.getDefaultPermutation();
	}
}

export { BlockMapper };

export { type MappedBlock, type MappedBlockPermutation } from '../../../types';
