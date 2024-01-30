import type { Buffer } from 'node:buffer';
import { CANONICAL_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import type { Byte } from '@serenityjs/nbt';
import { LightNBT, NBTTag } from '@serenityjs/nbt';
import type { BlockPermutation } from './Permutation';
import { BlockType } from './Type';

interface RawBlock {
	name: string;
	states: { [k: string]: Byte | string };
	version: number;
}

interface MappedBlock {
	identifier: string;
	permutations: MappedBlockPermutation[];
	runtimeId: number;
	states: string[];
	version: number;
}

interface MappedBlockPermutation {
	runtimeId: number;
	state: string;
	value: number | string;
}

class BlockMapper {
	public readonly blocks: Map<string, MappedBlock> = new Map();
	public readonly types: Map<string, BlockType> = new Map();

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

			// Check if the block already exists.
			if (this.blocks.has(data.name)) {
				// Get the block.
				// And get the states.
				const block = this.blocks.get(data.name)!;
				const states = Object.keys(data.states);
				const permutations = Object.values(data.states).map((state, index) => {
					return {
						value: state.valueOf(),
						runtimeId: runtimeId + index,
						state: states[index % states.length],
					};
				});

				// Update the block.
				this.blocks.set(data.name, {
					identifier: block.identifier,
					runtimeId: block.runtimeId,
					version: block.version,
					states: [...block.states],
					permutations: [...block.permutations, ...permutations],
				});
			} else {
				// Construct the block.
				const identifier = data.name;
				const states = Object.keys(data.states);
				const version = Number(data.version);
				const permutations = Object.values(data.states).map((state, index) => {
					return {
						value: state.valueOf(),
						runtimeId: runtimeId + index,
						state: states[index % states.length],
					};
				});

				// Add the block to the map.
				this.blocks.set(identifier, { identifier, runtimeId, version, states, permutations });
			}
		} while (!stream.cursorAtEnd());

		// Loop through the blocks.
		for (const block of this.blocks.values()) {
			// Construct the block type.
			// And add it to the map.
			const type = new BlockType(block);
			this.types.set(type.identifier, type);
		}
	}

	public getBlockType(identifier: string): BlockType {
		return this.types.get(identifier) ?? this.types.get('minecraft:air')!;
	}

	public getBlockTypeByRuntimeId(runtimeId: number): BlockType {
		return (
			[...this.types.values()].find((type) => type.getRuntimeId() === runtimeId) ?? this.types.get('minecraft:air')!
		);
	}

	public getBlockPermutation(
		identifier: string,
		states?: { [k: string]: boolean | number | string },
	): BlockPermutation {
		// Get the block type.
		// And return null if it doesn't exists.
		const block = this.types.get(identifier);
		if (!block) return this.getBlockType('minecraft:air')!.defaultPermutation;

		// No states specified, returing defualt permutation
		if (!states) return this.getBlockType(identifier)!.defaultPermutation;

		// Check if the queried states are valid.
		const statesKeys = Object.keys(states);

		// Loop through the states.
		for (const [, state] of statesKeys.entries()) {
			// Check if the state is valid.
			if (!block.states.includes(state)) {
				// The state is not valid.
				return this.getBlockType('minecraft:air')!.defaultPermutation;
			}
		}

		// Prepare a list of runtimes
		// And then sort them by the most common runtime
		const runtimes: number[] = [];
		for (const state of statesKeys) {
			const value = states[state];

			for (const permutation of block.permutations) {
				if (permutation.state === state && permutation.value === value) {
					runtimes.push(permutation.getRuntimeId());
				}
			}
		}

		// Find the mode of the runtimes
		// And check if it exists
		const runtime = runtimes
			.sort((a, b) => runtimes.filter((v) => v === a).length - runtimes.filter((v) => v === b).length)
			.pop();
		if (!runtime) return this.getBlockType('minecraft:air')!.defaultPermutation;

		// Return the permutation.
		return this.getBlockPermutationByRuntimeId(runtime);
	}

	public getBlockPermutationByRuntimeId(runtimeId: number): BlockPermutation {
		for (const type of this.types.values()) {
			const permutation = type.permutations.find((permutation) => permutation.getRuntimeId() === runtimeId);
			if (permutation) return permutation;
		}

		return this.types.get('minecraft:air')!.defaultPermutation;
	}
}

export { BlockMapper, type MappedBlock, type MappedBlockPermutation };
