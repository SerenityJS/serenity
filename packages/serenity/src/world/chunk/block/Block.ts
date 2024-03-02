import type { BlockCoordinates } from '@serenityjs/bedrock-protocol';
import type { Dimension } from '../../dimension/index.js';
import type { BlockPermutation } from './Permutation.js';

/**
 * Represents a block in the world.
 */
class Block {
	/**
	 * The dimension the block is in.
	 */
	public readonly dimension: Dimension;

	/**
	 * The permutation of the block.
	 */
	public readonly permutation: BlockPermutation;

	/**
	 * The location of the block.
	 */
	public readonly location: BlockCoordinates;

	/**
	 * Represents a block in the world.
	 *
	 * @param dimension The dimension the block is in.
	 * @param permutation The permutation of the block.
	 * @param location The location of the block.
	 */
	public constructor(dimension: Dimension, permutation: BlockPermutation, location: BlockCoordinates) {
		this.dimension = dimension;
		this.permutation = permutation;
		this.location = location;
	}

	/**
	 * Gets the block above this block.
	 *
	 * @param steps The amount of steps to go up.
	 */
	public above(steps?: number): Block {
		return this.dimension.getBlock(this.location.x, this.location.y + (steps ?? 1), this.location.z);
	}

	/**
	 * Gets the block below this block.
	 *
	 * @param steps The amount of steps to go down.
	 */
	public below(steps?: number): Block {
		return this.dimension.getBlock(this.location.x, this.location.y - (steps ?? 1), this.location.z);
	}

	/**
	 * Gets the block to the north of this block.
	 *
	 * @param steps The amount of steps to go north.
	 */
	public north(steps?: number): Block {
		return this.dimension.getBlock(this.location.x, this.location.y, this.location.z + (steps ?? 1));
	}

	/**
	 * Gets the block to the south of this block.
	 *
	 * @param steps The amount of steps to go south.
	 */
	public south(steps?: number): Block {
		return this.dimension.getBlock(this.location.x, this.location.y, this.location.z - (steps ?? 1));
	}

	/**
	 * Gets the block to the east of this block.
	 *
	 * @param steps The amount of steps to go east.
	 */
	public east(steps?: number): Block {
		return this.dimension.getBlock(this.location.x + (steps ?? 1), this.location.y, this.location.z);
	}

	/**
	 * Gets the block to the west of this block.
	 *
	 * @param steps The amount of steps to go west.
	 */
	public west(steps?: number): Block {
		return this.dimension.getBlock(this.location.x - (steps ?? 1), this.location.y, this.location.z);
	}

	/**
	 * Sets the permutation of the block.
	 *
	 * @param permutation The permutation to set.
	 */
	public setPermutation(permutation: BlockPermutation): void {
		this.dimension.setPermutation(this.location.x, this.location.y, this.location.z, permutation);
	}
}

export { Block };
