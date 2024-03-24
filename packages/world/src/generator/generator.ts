import type { Chunk } from "../chunk";

/**
 * Represents a generic generator.
 *
 * @abstract
 */
export abstract class TerrainGenerator {
	/**
	 * The seed of the generator.
	 */
	public readonly seed: number;

	/**
	 * Creates a new generator instance.
	 *
	 * @param seed The seed of the generator.
	 */
	public constructor(seed: number) {
		this.seed = seed;
	}

	/**
	 * Generates a chunk.
	 *
	 * @param x The x coordinate of the chunk.
	 * @param z The z coordinate of the chunk.
	 */
	public abstract apply(chunk: Chunk): Chunk;
}
