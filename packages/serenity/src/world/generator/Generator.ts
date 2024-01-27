import type { Serenity } from '../../Serenity';
import type { World } from '../World';
import type { ChunkColumn } from '../chunk';

/**
 * Represents a generic generator.
 *
 * @abstract
 */
abstract class Generator {
	/**
	 * The world instance.
	 */
	protected readonly world: World;

	/**
	 * The seed of the generator.
	 */
	public readonly seed: number;

	/**
	 * Creates a new generator instance.
	 *
	 * @param world The world instance.
	 * @param seed The seed of the generator.
	 */
	public constructor(world: World, seed: number) {
		this.world = world;
		this.seed = seed;
	}

	/**
	 * Generates a chunk.
	 *
	 * @param x The x coordinate of the chunk.
	 * @param z The z coordinate of the chunk.
	 */
	public generateChunk(x: number, z: number): ChunkColumn {
		throw new Error('Generator.generateChunk() is not implemented!');
	}
}

export { Generator };
