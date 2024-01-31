import type { BlockCoordinate } from '@serenityjs/bedrock-protocol';
import type { World } from '../../World';
import type { BlockPermutation } from './Permutation';
import type { BlockType } from './Type';

class Block {
	protected readonly world: World;

	public readonly type: BlockType;
	public readonly permutation: BlockPermutation;
	public readonly location: BlockCoordinate;

	public constructor(world: World, type: BlockType, permutation: BlockPermutation, location: BlockCoordinate) {
		this.world = world;
		this.type = type;
		this.permutation = permutation;
		this.location = location;
	}

	public setPermutation(state: Record<string, number | string>): Block {
		const permutation = this.type.permutations.find(
			(permutation) => JSON.stringify(permutation.value) === JSON.stringify(state),
		);

		if (!permutation) {
			this.world.logger.warn(
				`Failed to find permutation for ${this.type.identifier} with state ${JSON.stringify(state)}`,
			);

			return this;
		}

		// TODO: Update the block in the world.
		// Via setBlock or updateBlock.

		return new Block(this.world, this.type, permutation, this.location);
	}
}

export { Block };
