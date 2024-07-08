import type { CompoundTag } from "@serenityjs/nbt";
import type { Dimension, World } from "../world";
import type { Chunk } from "../chunk";
import type { PlayerEntry } from "../types";

class WorldProvider {
	/**
	 * The identifier for the provider.
	 */
	public static readonly identifier: string;

	/**
	 * The identifier for the provider.
	 */
	public readonly identifier = (this.constructor as typeof WorldProvider)
		.identifier;

	/**
	 * The constructor for the world provider.
	 * @param parameters The parameters for the world provider.
	 */
	public constructor(..._parameters: Array<unknown>) {
		return;
	}

	/**
	 * Initializes the world provider.
	 * @param path The path to initialize the world provider with.
	 */
	public static initialize(..._parameters: Array<unknown>): World {
		throw new Error("WorldProvider.initialize is not implemented");
	}

	/**
	 * Trigger to save any data that needs to be saved.
	 */
	public save(_shutdown = false): void {
		throw new Error("WorldProvider.save is not implemented");
	}

	/**
	 * Reads a chunk from the world.
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
	 * @param chunk The chunk to write to the world.
	 * @param dimension The dimension to write the chunk to.
	 */
	public writeChunk(_chunk: Chunk, _dimension: Dimension | string): void {
		throw new Error("WorldProvider.writeChunk is not implemented");
	}

	/**
	 * Reads a player from the world.
	 * @param uuid The UUID of the player to read.
	 * @returns The player read from the world.
	 */
	public readPlayer(_uuid: string): CompoundTag<PlayerEntry> {
		throw new Error("WorldProvider.readPlayer is not implemented");
	}

	/**
	 * Writes a player to the world.
	 * @param player The player to write to the world.
	 */
	public writePlayer(_player: CompoundTag<PlayerEntry>): void {
		throw new Error("WorldProvider.writePlayer is not implemented");
	}
}

export { WorldProvider };
