import { Logger, LoggerColors } from "@serenityjs/logger";
import { RaknetServer } from "@serenityjs/raknet";
import { Network, type NetworkSession } from "@serenityjs/network";
import { type Player, World, type WorldProvider } from "@serenityjs/world";
import { MINECRAFT_TICK_SPEED } from "@serenityjs/protocol";
import { Commands } from "@serenityjs/command";

import { SerenityHandler, HANDLERS } from "./handlers";
import { ServerProperties } from "./properties";

class Serenity {
	/**
	 * The server logger instance
	 */
	public readonly logger: Logger;

	/**
	 * The server properties instance
	 */
	public readonly properties: ServerProperties;

	/**
	 * The raknet server instance
	 */
	public readonly raknet: RaknetServer;

	/**
	 * The network instance
	 */
	public readonly network: Network;

	/**
	 * The players map
	 */
	public readonly players: Map<string, Player>;

	/**
	 * The worlds map
	 */
	public readonly worlds: Map<string, World>;

	/**
	 * The commands instance
	 */
	public readonly commands: Commands;

	/**
	 * The server tick interval
	 */
	public interval: NodeJS.Timeout | null = null;

	/**
	 * The server ticks
	 */
	public ticks: Array<number> = [];

	/**
	 * The server ticks per second
	 */
	public tps: number = 20; // TODO: Add option to set in server.properties

	public constructor() {
		// Assign instances
		this.logger = new Logger("Serenity", LoggerColors.Magenta);
		this.properties = new ServerProperties();

		// Set the debug logging
		Logger.DEBUG = this.properties.values["debug-logging"];

		// Create the raknet using the server address and port
		this.raknet = new RaknetServer(
			this.properties.values["server-address"],
			this.properties.values["server-port"]
		);

		// Set the max connections
		this.raknet.maxConnections = this.properties.values["max-players"];

		// Create the network instance using the raknet instance
		this.network = new Network(
			this.raknet,
			this.properties.values["network-comression-threshold"],
			this.properties.values["network-compression-algorithm"] === "zlib"
				? 0
				: 1,
			this.properties.values["network-packets-per-frame"],
			HANDLERS
		);

		this.players = new Map();
		this.worlds = new Map();
		this.commands = new Commands();

		// Set the Serenity instance for all handlers
		SerenityHandler.serenity = this;

		// Log the startup message
		this.logger.info("Serenity is now starting up...");
	}

	public start(): void {
		// Start the raknet instance.
		this.raknet.start();

		// Create a ticking loop with default 50ms interval
		// Handle delta time and tick the world
		const tick = () =>
			setTimeout(() => {
				// Assign the current time to the now variable
				const now = Date.now();

				// Push the current time to the ticks array
				this.ticks.push(now);

				// Calculate the ticking threshold
				// Filter the ticks array to remove all ticks older than 1000ms
				const threshold = now - 1000;
				this.ticks = this.ticks.filter((tick) => tick > threshold);

				// Calculate the TPS
				this.tps = this.ticks.length;

				// Tick all the worlds
				for (const world of this.worlds.values()) world.tick();

				// Tick the server
				tick();
			}, MINECRAFT_TICK_SPEED - 3.25);

		// Start the ticking loop
		this.interval = tick().unref();

		// Log the startup message
		this.logger.info(
			`Serenity is now up and running on ${this.raknet.address}:${this.raknet.port}`
		);
	}

	public stop(): void {
		// Clear the ticking interval
		if (this.interval) clearInterval(this.interval);

		// Stop the raknet instance
		this.raknet.stop();
	}

	public getPlayer(session: NetworkSession): Player | undefined {
		return [...this.players.values()].find(
			(player) => player.session === session
		);
	}

	public getWorld(name?: string): World {
		return this.worlds.get(name ?? "default") as World;
	}

	public createWorld(name: string, provider: WorldProvider): World {
		// Check if the world already exists
		if (this.worlds.has(name)) {
			this.logger.error(`Failed to create world "${name}," it already exists.`);

			return this.worlds.get(name) as World;
		}

		// Create the world
		const world = new World(name, provider);

		// Set the world
		this.worlds.set(name, world);

		// Return the world
		return world;
	}
}

export { Serenity };
