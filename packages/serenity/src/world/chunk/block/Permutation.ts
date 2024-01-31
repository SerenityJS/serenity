import { BlockType } from './Type';

class BlockPermutation {
	public static permutations: BlockPermutation[] = [];

	protected readonly runtimeId: number;
	protected readonly states: Record<string, number | string>;

	public readonly type: BlockType;

	public constructor(type: BlockType, runtimeId: number, states: Record<string, number | string>) {
		this.type = type;
		this.runtimeId = runtimeId;
		this.states = states;
	}

	public getRuntimeId(): number {
		return this.runtimeId;
	}

	public static resolve(identifier: string, states?: Record<string, number | string>): BlockPermutation {
		// Find the block type.
		const type = BlockType.resolve(identifier);

		// Find the permutation.
		const permutation = BlockPermutation.permutations.find(
			(permutation) => permutation.type === type && JSON.stringify(permutation.states) === JSON.stringify(states),
		);

		// Return the permutation.
		return permutation ?? type.getDefaultPermutation();
	}
}

export { BlockPermutation };
