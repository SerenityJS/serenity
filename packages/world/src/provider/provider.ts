import type { Entity } from "../entity";
import type { Player } from "../player";
import type { CompoundTag } from "@serenityjs/nbt";
import type { Dimension, World } from "../world";
import type { Chunk } from "../chunk";
import type { PlayerEntry, WorldConfig } from "../types";

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
	 * @param config The configuration for the world.
	 * @param parameters The additional parameters for the world provider.
	 * @returns The world created by the provider.
	 */
	public static initialize(
		_config: WorldConfig,
		..._parameters: Array<unknown>
	): World {
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
	 * Reads the entities that are in the chunk.
	 * @param _chunk The chunk to read the entities from.
	 * @param _dimension The dimension to read the entities from.
	 * @returns The entities read from the chunk.
	 */
	public readEntities(_chunk: Chunk, _dimension: Dimension): Array<Entity> {
		throw new Error("WorldProvider.readEntities is not implemented");
	}

	/**
	 * Writes the entities to the chunk.
	 * @param _entities The entities to write to the chunk.
	 * @param _chunk The chunk to write the entities to.
	 * @param _dimension The dimension to write the entities to.
	 */
	public writeEntities(
		_entities: Array<Entity>,
		_chunk: Chunk,
		_dimension: Dimension
	): void {
		throw new Error("WorldProvider.writeEntities is not implemented");
	}

	/**
	 * Reads a player from the world.
	 * @param uuid The UUID of the player to read.
	 * @returns The player read from the world.
	 */
	public readPlayer(_player: string | Player): CompoundTag<PlayerEntry> {
		throw new Error("WorldProvider.readPlayer is not implemented");
	}

	/**
	 * Writes a player to the world.
	 * @param player The player to write to the world.
	 */
	public writePlayer(_player: Player): void {
		throw new Error("WorldProvider.writePlayer is not implemented");
	}
}

export { WorldProvider };
