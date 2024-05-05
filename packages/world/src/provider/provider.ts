import type { Chunk } from "../chunk";
import type { Dimension, World } from "../world";

class WorldProvider {
	/**
	 * The identifier for the provider.
	 */
	public static readonly identifier: string;

	/**
	 * The constructor for the world provider.
	 *
	 * @param parameters The parameters for the world provider.
	 */
	public constructor(..._parameters: Array<unknown>) {}

	/**
	 * Initializes the world provider.
	 *
	 * @param path The path to initialize the world provider with.
	 */
	public static intialize(..._parameters: Array<unknown>): World {
		throw new Error("WorldProvider.intialize is not implemented");
	}

	/**
	 * Trigger to save any data that needs to be saved.
	 */
	public save(): void {
		throw new Error("WorldProvider.save is not implemented");
	}

	/**
	 * Reads a chunk from the world.
	 *
	 * @param cx The chunk x coordinate.
	 * @param cz The chunk z coordinate.
	 * @param dimension The dimension to read the chunk from.
	 * @returns The chunk read from the world.
	 */
	public readChunk(_cx: number, _cz: number, _dimension: Dimension): Chunk {
		throw new Error("WorldProvider.readChunk is not implemented");
	}

	/**
	 * Writes a chunk to the world.
	 *
	 * @param chunk The chunk to write to the world.
	 * @param dimension The dimension to write the chunk to.
	 */
	public writeChunk(_chunk: Chunk, _dimension: Dimension): void {
		throw new Error("WorldProvider.writeChunk is not implemented");
	}
}

export { WorldProvider };
