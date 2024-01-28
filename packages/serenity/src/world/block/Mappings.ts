import { MAPPED_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { BinaryStream } from '@serenityjs/binarystream';
import { LightNBT } from '@serenityjs/nbt';
import { BlockPermutation } from './Permutation';
import { BlockType } from './Type';

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
}

export {
	BlockMappings,
	type MappedBlockState,
	type MappedBlockStateEntry,
	type MappedBlockStatePermutation,
	type MappedBlockStateType,
};
