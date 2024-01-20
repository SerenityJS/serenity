import type { Serenity } from '../../Serenity';
import type { ChunkColumn } from '../chunk';

/**
 * Represents a generic generator.
 *
 * @abstract
 */
abstract class Generator {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	/**
	 * The seed of the generator.
	 */
	public readonly seed: number;

	/**
	 * Creates a new generator instance.
	 *
	 * @param serenity The serenity instance.
	 * @param seed The seed of the generator.
	 */
	public constructor(serenity: Serenity, seed: number) {
		this.serenity = serenity;
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
