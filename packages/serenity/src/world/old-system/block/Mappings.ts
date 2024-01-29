import { MAPPED_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import type { Int16} from '@serenityjs/nbt';
import { LightNBT } from '@serenityjs/nbt';
import type { Block } from './blocks';
import { VANILLA_BLOCKS } from './blocks';
import { BlockPermutation, BlockType } from './data';

interface MappedBlockStateEntry {
	permutations: { [entry: string]: MappedBlockState };
	version: number;
}

interface MappedBlockState {
	id: number;
	name: string;
	permutations: MappedBlockStatePermutation[];
	size: number;
	type: MappedBlockStateType;
}

interface MappedBlockStatePermutation {
	i: number;
	v: any[];
}

interface MappedBlockStateType {
	length: number;
	names: string[];
	types: number[];
}

class BlockMappings {
	public readonly types: Map<number, BlockType> = new Map();
	public readonly permutations: Map<number, BlockPermutation> = new Map();
	public readonly blocks: Map<number, typeof Block> = new Map();

	public constructor() {
		// Create a new stream from the MAPPED_BLOCK_STATES file
		const stream = new BinaryStream(MAPPED_BLOCK_STATES);

		// Read the root nbt tag
		const { permutations: states } = LightNBT.ReadRootTag(stream) as MappedBlockStateEntry;

		// Loop through the blocks, reading their names and IDs
		for (const key of Object.keys(states)) {
			const { name, permutations, type, id } = states[key];

			// Construct the block type
			const blockType = new BlockType(name, type, permutations, id);

			// Add the block to the map
			this.types.set(id, blockType);

			// Add the permutations to the map
			for (const key of Object.keys(blockType.permutations)) {
				const permutation = blockType.permutations[key];
				this.permutations.set(permutation.runtimeId, permutation);
			}

			// Get the block class
			// And check if it exists
			const block = VANILLA_BLOCKS.find((block) => block.id === name);
			if (!block) continue;

			// Set the block type and permutation
			block.type = this.getBlockType(name)!;
			block.permutation = this.getBlockPermutation(name, block.states)!; // TODO: Implement states

			// Add the block to the map
			this.blocks.set(block.permutation.runtimeId, block);
		}
	}

	public getBlockPermutation(name: string, states?: { [entry: string]: any }): BlockPermutation | null {
		// Get the permutation from the name
		const permutation = [...this.permutations.entries()].find(([, permutation]) => permutation.type.name === name)?.[1];

		// If there is no permutation, return null
		if (!permutation) return null;

		// If there is no query states, return the permutation
		if (!states) return permutation;

		// Prepare the values
		// And get the permutation name
		const values = [];
		for (const name of permutation.type.states.names) values.push(states[name] ?? 0);
		const permutationName = BlockPermutation.buildPermutation(permutation.type, values);

		// Return the permutation
		return permutation.type.permutations[permutationName] ?? null;
	}

	public getBlockPermutationByRuntimeId(id: number): BlockPermutation | null {
		return this.permutations.get(id) ?? null;
	}

	public getBlockType(name: string): BlockType | null {
		// Get the block type
		const type = [...this.types.values()].find((type) => type.name === name);

		// Return the block type
		return type ?? null;
	}

	public getBlockTypeByRuntimeId(id: number): BlockType | null {
		// Get the block type & return it
		return [...this.permutations.values()].find((permutation) => permutation.runtimeId === id)?.type ?? null;
	}

	public getBlock(name: string, states?: { [entry: string]: any }): typeof Block | null {
		// Get the block & return it
		return this.blocks.get(this.getBlockPermutation(name, states)?.runtimeId ?? -1) ?? null;
	}

	public getBlockByRuntimeId(id: number): typeof Block | null {
		// Get the block & return it
		return this.blocks.get(id) ?? null;
	}
}

export {
	BlockMappings,
	type MappedBlockState,
	type MappedBlockStateEntry,
	type MappedBlockStatePermutation,
	type MappedBlockStateType,
};
