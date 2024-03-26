import { DataPacket, DimensionType } from "@serenityjs/protocol";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { WorldProvider } from "../provider";
import { BlockRegistry } from "../block";
import { Player } from "../player";
import { TerrainGenerator } from "../generator";
import { Entity } from "../entity";
import { ItemRegistry } from "../item";

import { Dimension } from "./dimension";

class World {
	/**
	 * The items registry for all the items in all the worlds.
	 */
	public static readonly items: ItemRegistry = new ItemRegistry();

	/**
	 * The blocks registry for all the blocks in all the worlds.
	 */
	public static readonly blocks: BlockRegistry = new BlockRegistry();

	/**
	 * The identifier of the world.
	 */
	public readonly identifier: string;

	/**
	 * The data provider for the world.
	 */
	public readonly provider: WorldProvider;

	/**
	 * The dimensions within the world.
	 */
	public readonly dimensions: Map<string, Dimension>;

	/**
	 * The logger for the world.
	 */
	public readonly logger: Logger;

	/**
	 * Creates a new world.
	 *
	 * @param identifier The identifier of the world.
	 * @param provider The data provider for the world.
	 * @returns A new world.
	 */
	public constructor(identifier: string, provider: WorldProvider) {
		this.identifier = identifier;
		this.provider = provider;
		this.dimensions = new Map();
		this.logger = new Logger(identifier, LoggerColors.GreenBright);
	}

	/**
	 * Ticks the world instance.
	 */
	public tick(): void {
		// Tick all the dimensions
		for (const dimension of this.dimensions.values()) dimension.tick();
	}

	/**
	 * Gets all the players in the world.
	 */
	public getPlayers(): Array<Player> {
		return [...this.dimensions.values()].flatMap((dimension) =>
			dimension.getPlayers()
		);
	}

	/**
	 * Gets all the entities in the world.
	 */
	public getEntities(): Array<Entity> {
		return [...this.dimensions.values()].flatMap((dimension) =>
			dimension.getEntities()
		);
	}

	/**
	 * Gets a dimension by its identifier.
	 *
	 * @param identifier The identifier of the dimension.
	 * @returns The dimension that was found.
	 */
	public getDimension(identifier?: string): Dimension {
		return this.dimensions.get(identifier ?? "minecraft:overworld")!;
	}

	/**
	 * Creates a new dimension.
	 *
	 * @param identifier The identifier of the dimension.
	 * @param type The type of the dimension.
	 * @param generator The generator of the dimension.
	 * @returns A new dimension.
	 */
	public createDimension(
		identifier: string,
		type: DimensionType,
		generator: TerrainGenerator
	): Dimension {
		// Check if the dimension already exists
		if (this.dimensions.has(identifier)) {
			this.logger.error(
				`Failed to create dimension "${identifier}," it already exists.`
			);

			return this.dimensions.get(identifier)!;
		}

		// Create the dimension
		const dimension = new Dimension(identifier, type, generator, this);

		// Set the dimension
		this.dimensions.set(identifier, dimension);

		// Return the dimension
		return dimension;
	}

	public broadcast(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers()) player.session.send(...packets);
	}

	public broadcastImmediate(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers())
			player.session.sendImmediate(...packets);
	}

	public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
		for (const x of this.getPlayers())
			if (x !== player) x.session.send(...packets);
	}
}

export { World };
