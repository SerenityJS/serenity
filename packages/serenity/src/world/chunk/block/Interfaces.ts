import type { Int16 } from '@serenityjs/nbt';

export interface MappedBlockStateEntry {
	permutations: { [entry: string]: MappedBlockState };
	version: number;
}

export interface MappedBlockState {
	id: Int16;
	name: string;
	permutations: MappedBlockStatePermutation[];
	size: number;
	type: MappedBlockStateType;
}

export interface MappedBlockStatePermutation {
	i: Int16;
	v: any[];
}

export interface MappedBlockStateType {
	length: number;
	names: string[];
	types: number[];
}
