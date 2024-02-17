import type { Serenity } from '../Serenity.js';
import type { Chunk, Dimension } from '../world/index.js';

/**
 * The world provider providers a basic standard for reading and writing chunks to and from the world.
 * Developers can extend this class to create their own world provider for specific projects.
 */
class WorldProvider {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	/**
	 * The identifier for the provider.
	 */
	public static identifier: string;

	/**
	 * Constructs a new world provider.
	 *
	 * @param serenity - The serenity instance.
	 */
	public constructor(serenity: Serenity) {
		this.serenity = serenity;
	}

	/**
	 * Reads a chunk from the world.
	 *
	 * @param cx - The chunk x coordinate.
	 * @param cz - The chunk z coordinate.
	 * @param dimension - The dimension to read the chunk from.
	 * @returns The chunk read from the world.
	 */
	public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
		throw new Error('WorldProvider.readChunk is not implemented');
	}

	/**
	 * Writes a chunk to the world.
	 *
	 * @param chunk - The chunk to write to the world.
	 * @param dimension - The dimension to write the chunk to.
	 */
	public writeChunk(chunk: Chunk, dimension: Dimension): void {
		throw new Error('WorldProvider.writeChunk is not implemented');
	}
}

export { WorldProvider };
