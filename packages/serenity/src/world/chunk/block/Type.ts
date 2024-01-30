import type { MappedBlock } from './Mapper';
import { BlockPermutation } from './Permutation';

class BlockType {
	protected readonly version: number;

	public readonly identifier: string;

	public readonly states: string[];

	public readonly permutations: BlockPermutation[];

	public readonly defaultPermutation: BlockPermutation;

	public constructor(mapped: MappedBlock, index?: number) {
		this.version = mapped.version;
		this.identifier = mapped.identifier;
		this.states = mapped.states;
		this.permutations = mapped.permutations.map((permutation) => new BlockPermutation(this, permutation));
		this.defaultPermutation =
			this.permutations.length > 0
				? this.permutations[index ?? 0]
				: new BlockPermutation(this, { runtimeId: mapped.runtimeId, state: '', value: '' });
	}

	public getRuntimeId(): number {
		return this.defaultPermutation.getRuntimeId();
	}
}

export { BlockType };
