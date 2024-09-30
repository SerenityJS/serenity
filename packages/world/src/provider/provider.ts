import type { Entity } from "../entity";
import type { Player } from "../player";
import type { CompoundTag } from "@serenityjs/nbt";
import type { Dimension, World } from "../world";
import type { Chunk } from "../chunk";
import type { WorldConfig } from "../types";

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
	 * The world instance that the provider belongs to.
	 */
	public world!: NonNullable<World>;

	/**
	 * The constructor for the world provider.
	 * @param parameters The additional parameters for the world provider.
	 */
	public constructor(..._parameters: Array<unknown>) {
		return;
	}

	/**
	 * Gets the index of a specific dimension.
	 * @param dimension The dimension to get the index of.
	 * @returns The index of the dimension, or -1 if the dimension does not exist.
	 */
	public dimensionIndexOf(dimension: string | Dimension): number {
		// Convert the dimension to a string.
		const identifier =
			typeof dimension === "string" ? dimension : dimension.identifier;

		// Get the index of the dimension.
		return [...this.world.dimensions.keys()].indexOf(identifier);
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
	 * Called when the world provider should start up.
	 */
	public onStartup(): void {}

	/**
	 * Called when the world provider should shut down.
	 */
	public onShutdown(): void {}

	/**
	 * Trigger to save any data that needs to be saved.
	 */
	// TODO Rename to onSave
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
	 * Reads the available actor unique ids in the dimension.
	 * @param dimension The dimension to read the available actors from.
	 * @returns An array of available actor unique ids.
	 */
	public readAvailableActors(_dimension: Dimension): Array<bigint> {
		throw new Error("WorldProvider.readAvailableActors is not implemented");
	}

	/**
	 * Writes the available actor unique ids to the dimension.
	 * @param dimension The dimension to write the available actors
	 * @param uniqueIds The unique ids to write.
	 */
	public writeAvailableActors(
		_dimension: Dimension,
		_uniqueIds: Array<bigint>
	): void {
		throw new Error("WorldProvider.writeAvailableActors is not implemented");
	}

	public readBlockData(_dimension: Dimension): Array<CompoundTag> {
		throw new Error("WorldProvider.readBlockData is not implemented");
	}

	public writeBlockData(
		_dimension: Dimension,
		_data: Array<CompoundTag>
	): void {
		throw new Error("WorldProvider.writeBlockData is not implemented");
	}

	/**
	 * Reads an entity from the world.
	 * @param dimension The dimension to read the entity from.
	 * @param entity The entity to read.
	 * @returns CompoundTag of the entity.
	 */
	public readEntity(
		_dimension: Dimension,
		_entity: bigint | Entity
	): CompoundTag {
		throw new Error("WorldProvider.readEntity is not implemented");
	}

	/**
	 * Writes an entity to the world.
	 * @param entity The entity to write to the world.
	 */
	public writeEntity(_entity: Entity): void {
		throw new Error("WorldProvider.writeEntity is not implemented");
	}

	/**
	 * Checks if the player is saved in the world.
	 * @param Player The player to check.
	 * @returns True if the player is saved in the world.
	 */
	public hasPlayer(_player: string | Player): boolean {
		return false;
	}

	/**
	 * Gets the unique id of the player.
	 * @param player The player to get the unique id of.
	 */
	public getPlayerUniqueId(_player: string | Player): bigint {
		throw new Error("WorldProvider.getPlayerUniqueId is not implemented");
	}

	/**
	 * Reads a player from the world.
	 * @param uuid The UUID of the player to read.
	 * @returns The player read from the world.
	 */
	public readPlayer(_player: string | Player): CompoundTag {
		throw new Error("WorldProvider.readPlayer is not implemented");
	}

	/**
	 * Writes a player to the world.
	 * @param player The player to write to the world.
	 */
	public writePlayer(_player: Player): void {
		throw new Error("WorldProvider.writePlayer is not implemented");
	}

	/**
	 * Reads a property from the world.
	 * @param key The key of the property to read.
	 */
	public readProperty(_key: Buffer): Buffer {
		throw new Error("WorldProvider.readProperty is not implemented");
	}

	/**
	 * Writes a property to the world.
	 * @param key The key of the property to write.
	 * @param value The value of the property to write.
	 */
	public writeProperty(_key: Buffer, _value: Buffer): void {
		throw new Error("WorldProvider.writeProperty is not implemented");
	}

	public readChunkCache(
		_cx: number,
		_cz: number,
		_dimension: Dimension
	): Chunk | null {
		throw new Error("WorldProvider.readChunkCache is not implemented");
	}

	public rentChunk<T extends object>(
		_borrower: T,
		_cx: number,
		_cz: number,
		_dimension: Dimension
	): Chunk {
		throw new Error("WorldProvider.rentChunk is not implemented");
	}

	public returnChunk<T extends object>(
		_borrower: T,
		_cx: number,
		_cz: number,
		_dimension: Dimension
	): boolean {
		throw new Error("WorldProvider.returnChunk is not implemented");
	}
}

export { WorldProvider };
