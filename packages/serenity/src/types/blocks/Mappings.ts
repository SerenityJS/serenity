import type { Int16 } from '@serenityjs/nbt';

interface MappedBlockStateEntry {
	permutations: { [entry: string]: MappedBlockState };
	version: number;
}

interface MappedBlockState {
	id: Int16;
	name: string;
	permutations: MappedBlockStatePermutation[];
	size: number;
	type: MappedBlockStateType;
}

interface MappedBlockStatePermutation {
	i: Int16;
	v: any[];
}

interface MappedBlockStateType {
	length: number;
	names: string[];
	types: number[];
}

export type { MappedBlockStateEntry, MappedBlockState, MappedBlockStatePermutation, MappedBlockStateType };
