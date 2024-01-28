import type { MappedBlockStatePermutation, MappedBlockStateType } from './Mappings';
import { BlockPermutation } from './Permutation';

class BlockType {
	public readonly name: string;
	public readonly runtimeId: number;
	public readonly defaultPermutation!: BlockPermutation;
	public readonly permutations: { [entry: string]: BlockPermutation } = {};
	public readonly states;

	public constructor(
		name: string,
		states: MappedBlockStateType,
		permutations: MappedBlockStatePermutation[],
		runtimeId: number,
	) {
		this.name = name;
		this.runtimeId = runtimeId;
		this.states = states;

		for (const perm of permutations) {
			const permutation = new BlockPermutation(this, perm);
			this.permutations[permutation.name] = permutation;
			if (!this.defaultPermutation) this.defaultPermutation = permutation;
		}

		if (!this.defaultPermutation) {
			this.defaultPermutation = new BlockPermutation(this, { i: runtimeId, v: [] });
			this.permutations[this.defaultPermutation.name] = this.defaultPermutation;
		}
	}
}

export { BlockType };
