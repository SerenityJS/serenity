import type { BlockPermutation } from './Permutation';

class BlockType {
	public static types: BlockType[] = [];

	protected readonly version: number;

	public readonly identifier: string;

	public readonly permutations: BlockPermutation[];

	public constructor(version: number, identifier: string) {
		this.version = version;
		this.identifier = identifier;
		this.permutations = [];
	}

	public getDefaultPermutation(): BlockPermutation {
		return this.permutations[0];
	}

	public static resolve(identifier: string): BlockType {
		return this.types.find((type) => type.identifier === identifier)!;
	}
}

export { BlockType };
