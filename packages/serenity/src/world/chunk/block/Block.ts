import type { BlockCoordinate } from '@serenityjs/bedrock-protocol';
import type { Dimension } from '../../dimension';
import type { BlockPermutation } from './Permutation';

class Block {
	public readonly dimension: Dimension;
	public readonly permutation: BlockPermutation;
	public readonly location: BlockCoordinate;

	public constructor(dimension: Dimension, permutation: BlockPermutation, location: BlockCoordinate) {
		this.dimension = dimension;
		this.permutation = permutation;
		this.location = location;
	}

	public setPermutation(permutation: BlockPermutation): void {
		this.dimension.setPermutation(this.location.x, this.location.y, this.location.z, permutation);
	}
}

export { Block };
