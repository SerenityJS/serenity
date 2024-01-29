import type { Int16 } from '@serenityjs/nbt';
import type { MappedBlockStatePermutation, MappedBlockStateType } from '../../../types';
import type { BlockPermutation } from './Permutation';
import { MappedBlockPermutation } from './Permutation';

export abstract class BlockType {
	public readonly id: string;
	public readonly defaultRuntimeId: number;
	public abstract readonly defaultPermutation: BlockPermutation;
	protected abstract readonly permutations: Map<string, BlockPermutation>;
	protected abstract readonly states: MappedBlockStateType;

	public constructor(name: string, runtimeId: number) {
		this.id = name;
		this.defaultRuntimeId = runtimeId;
	}
	public getAllPermutations() {
		return this.permutations.values();
	}
}
export class MappedBlockType extends BlockType {
	public readonly defaultPermutation!: MappedBlockPermutation;
	public readonly states: MappedBlockStateType;
	public readonly permutations: Map<string, MappedBlockPermutation> = new Map();
	public constructor(
		name: string,
		states: MappedBlockStateType,
		permutations: MappedBlockStatePermutation[],
		runtimeId: Int16,
	) {
		super(name, Number(runtimeId));
		this.states = states;
		for (const perm of permutations) {
			const permutation = new MappedBlockPermutation(this, perm);
			this.permutations.set(permutation.uniqueId, permutation);
			if (!this.defaultPermutation) this.defaultPermutation = permutation;
		}

		if (!this.defaultPermutation) {
			this.defaultPermutation = new MappedBlockPermutation(this, { i: runtimeId, v: [] });
			this.permutations.set(this.defaultPermutation.uniqueId, this.defaultPermutation);
		}
	}
}
