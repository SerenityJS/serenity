import type { BlockPermutation, BlockType } from '../data';

// TODO: Implement metadata for chunk serialization.
// The block permutation will hold the block runtime ID and possible block states.

/**
 * Represents a block in the world.
 */
abstract class Block {
	/**
	 * The name of the block.
	 */
	public static readonly id: string;

	/**
	 * The block type.
	 */
	public static type: BlockType;

	/**
	 * The block permutation.
	 */
	public static permutation: BlockPermutation;

	/**
	 * The block states.
	 */
	public static states: { [entry: string]: any };

	/**
	 * The block runtime ID.
	 *
	 * @returns The block runtime ID.
	 */
	public static getRuntimeId(): number {
		return this.permutation.runtimeId;
	}

	/**
	 * The block name.
	 *
	 * @returns The block name.
	 */
	public static getName(): string {
		return this.type.name;
	}
}

export { Block };
