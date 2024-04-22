import type { Chunk } from "../chunk";
import type { Dimension } from "../world";

class WorldProvider {
	/**
	 * The identifier for the provider.
	 */
	public static identifier: string;

	/**
	 * Whether or not the provider supports hashes.
	 */
	public readonly hashes: boolean;

	public constructor(hashes?: boolean) {
		this.hashes = hashes ?? true;
	}

	/**
	 * Reads a chunk from the world.
	 *
	 * @param cx - The chunk x coordinate.
	 * @param cz - The chunk z coordinate.
	 * @param dimension - The dimension to read the chunk from.
	 * @returns The chunk read from the world.
	 */
	public readChunk(_cx: number, _cz: number, _dimension: Dimension): Chunk {
		throw new Error("WorldProvider.readChunk is not implemented");
	}

	/**
	 * Writes a chunk to the world.
	 *
	 * @param chunk - The chunk to write to the world.
	 * @param dimension - The dimension to write the chunk to.
	 */
	public writeChunk(_chunk: Chunk, _dimension: Dimension): void {
		throw new Error("WorldProvider.writeChunk is not implemented");
	}
}

export { WorldProvider };
