interface RawBlock {
	name: string;
	states: Record<string, number | string>;
	version: number;
}

interface MappedBlock {
	identifier: string;
	permutations: Array<MappedBlockPermutation>;
	version: number;
}

interface MappedBlockPermutation {
	runtimeId: number;
	states: Record<string, number | string>;
}

export type { RawBlock, MappedBlock, MappedBlockPermutation };
