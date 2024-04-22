import {
	type DataPacket,
	type DimensionType,
	TextPacket,
	TextPacketType
} from "@serenityjs/protocol";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { Commands } from "@serenityjs/command";

import { Dimension } from "./dimension";

import type { TerrainGenerator } from "../generator";
import type { Entity } from "../entity";
import type { WorldProvider } from "../provider";
import type { Player } from "../player";

class World {
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
	 * The commands for the world.
	 */
	public readonly commands: Commands<Entity | Dimension>;

	/**
	 * The logger for the world.
	 */
	public readonly logger: Logger;

	/**
	 * The current tick of the world.
	 */
	public currentTick = 0n;

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
		this.commands = new Commands();
		this.logger = new Logger(identifier, LoggerColors.GreenBright);
	}

	/**
	 * Ticks the world instance.
	 */
	public tick(): void {
		// Check if there are no players in the world
		if (this.getPlayers().length === 0) return;

		// Add one to the current tick
		this.currentTick++;

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
		return this.dimensions.get(
			identifier ?? "minecraft:overworld"
		) as Dimension;
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

			return this.dimensions.get(identifier) as Dimension;
		}

		// Create the dimension
		const dimension = new Dimension(identifier, type, generator, this);

		// Set the dimension
		this.dimensions.set(identifier, dimension);

		// Return the dimension
		return dimension;
	}

	/**
	 * Broadcasts packets to all the players in the world.
	 *
	 * @param packets The packets to broadcast.
	 */
	public broadcast(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers()) player.session.send(...packets);
	}

	/**
	 * Broadcasts packets to all the players in the world immediately.
	 *
	 * @param packets The packets to broadcast.
	 */
	public broadcastImmediate(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers())
			player.session.sendImmediate(...packets);
	}

	/**
	 * Broadcasts packets to all the players in the world except one.
	 *
	 * @param player The player to exclude.
	 * @param packets The packets to broadcast.
	 */
	public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
		for (const x of this.getPlayers())
			if (x !== player) x.session.send(...packets);
	}

	/**
	 * Sends a message to all the players in the world.
	 * @param message The message to send.
	 */
	public sendMessage(message: string): void {
		// Create a new TextPacket
		const packet = new TextPacket();

		// Set the packet properties
		packet.type = TextPacketType.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = "";
		packet.platformChatId = "";

		// Broadcast the packet
		this.broadcast(packet);
	}
}

export { World };
