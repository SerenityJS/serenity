import { BlockPermutation } from './Permutation.js';

class BlockType {
	/**
	 * The block types.
	 */
	public static types: BlockType[] = [];

	/**
	 * The block version.
	 */
	protected readonly version: number;

	/**
	 * The block identifier.
	 */
	public readonly identifier: string;

	/**
	 * The block permutations.
	 */
	public readonly permutations: BlockPermutation[];

	/**
	 * Creates a new block type instance.
	 *
	 * @param version The block version.
	 * @param identifier The block identifier.
	 */
	public constructor(version: number, identifier: string) {
		this.version = version;
		this.identifier = identifier;
		this.permutations = [];
	}

	/**
	 * Gets the block permutations. If states are not provided, the default permutation is returned.
	 *
	 * @returns Returns the block permutations.
	 */
	public getPermutation(states?: Record<string, number | string>): BlockPermutation {
		if (states) {
			return BlockPermutation.resolve(this.identifier, states);
		} else {
			return this.permutations[0];
		}
	}

	/**
	 * Resolves a block type.
	 *
	 * @param identifier The block identifier.
	 * @returns Returns the block type.
	 */
	public static resolve(identifier: string): BlockType {
		return this.types.find((type) => type.identifier === identifier)!;
	}
}

export { BlockType };
