import type { DimensionType } from "@serenityjs/protocol";
import type { Chunk } from "../chunk";

/**
 * Represents a generic generator.
 *
 * @abstract
 */
export class TerrainGenerator {
	/**
	 * The identifier for the generator.
	 */
	public static readonly identifier: string;

	/**
	 * The identifier for the provider.
	 */
	public readonly identifier = (this.constructor as typeof TerrainGenerator)
		.identifier;

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
	 * Generates a chunk at the specified coordinates.
	 * @param _cx The chunk x coordinate.
	 * @param _cz The chunk z coordinate.
	 * @param _type The dimension type.
	 */
	public apply(_cx: number, _cz: number, _type: DimensionType): Chunk {
		throw new Error("Not implemented.");
	}
}
