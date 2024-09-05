import { Logger, LoggerColors } from "@serenityjs/logger";
import { Server } from "@serenityjs/raknet";
import { Network, type NetworkSession } from "@serenityjs/network";
import { Plugins } from "@serenityjs/plugins";
import { WorldEvent, type Player } from "@serenityjs/world";

import { SerenityHandler, HANDLERS } from "./handlers";
import { Properties } from "./properties";
import { ResourcePackManager } from "./resource-packs/resource-pack-manager";
import { Worlds } from "./worlds";
import { DEFAULT_SERVER_PROPERTIES } from "./properties/default";
import { Permissions } from "./permissions";
import { Console } from "./commands";

import type { DataPacket } from "@serenityjs/protocol";
import type { DefaultServerProperties } from "./types";

class Serenity {
	/**
	 * The server logger instance
	 */
	public readonly logger: Logger;

	/**
	 * The server properties instance
	 */
	public readonly properties: Properties<DefaultServerProperties>;

	/**
	 * The server permissions instance for managing player permissions
	 */
	public readonly permissions: Permissions;

	/**
	 * The raknet server instance
	 */
	public readonly raknet: Server;

	/**
	 * The network instance
	 */
	public readonly network: Network;

	/**
	 * The players map
	 */
	public readonly players: Map<string, Player>;

	/**
	 * The worlds manager.
	 */
	public readonly worlds: Worlds;

	/**
	 * The resource pack manager instance
	 */
	public readonly resourcePacks: ResourcePackManager;

	/**
	 * The plugins manager instance
	 */
	public readonly plugins: Plugins;

	/**
	 * The console instance
	 */
	public readonly console = new Console(this);

	public readonly connecting: Map<NetworkSession, Array<DataPacket>> =
		new Map();

	/**
	 * Whether the server is stopped
	 */
	public stopped = false;

	/**
	 * The server ticks
	 */
	public ticks: Array<number> = [];

	public tick = 0;

	/**
	 * The server ticks per second
	 */
	public tps: number = 20;

	public constructor() {
		// Assign instances
		this.logger = new Logger("Serenity", LoggerColors.Magenta);
		this.properties = new Properties(
			"./server.properties",
			DEFAULT_SERVER_PROPERTIES
		);

		// Set the permissions instance
		this.permissions = new Permissions();

		// Set the debug logging
		Logger.DEBUG = this.properties.values["debug-logging"];

		// Create the raknet using the server address and port
		this.raknet = new Server(
			this.properties.values["server-address"],
			this.properties.values["server-port"],
			this.properties.values["server-mtu-max"],
			this.properties.values["server-mtu-min"]
		);

		// Set the max connections
		this.raknet.maxConnections = this.properties.values["max-players"];

		// Set the message of the day
		this.raknet.message = this.properties.values["server-name"];

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

		this.resourcePacks = new ResourcePackManager(
			"./resource_packs",
			this.properties.values["resource-packs"],
			this.properties.values["must-accept-packs"]
		);

		// Set the Serenity instance for all handlers and event signals
		SerenityHandler.serenity = this;

		// Register the worlds manager
		this.worlds = new Worlds(this);

		// Create the plugins instance
		this.plugins = new Plugins(
			this.properties.values["plugins-path"],
			this.properties.values["plugins-enabled"]
		);

		// Log the startup message
		this.logger.info("Serenity is now starting up...");
	}

	public async start(): Promise<void> {
		// Set the server to not stopped
		this.stopped = false;

		// Initialize the worlds
		await this.worlds.initialize();
		await this.plugins.initialize(this);

		// Start the raknet instance.
		this.raknet.start();

		// Iterate over all the plugins to bind the exported event handlers
		for (const plugin of this.plugins.getAll()) {
			// Check if the module has the event handlers
			const keys = Object.keys(plugin.module);

			// Get all the world events
			const events = Object.keys(WorldEvent);

			// Iterate over all the events
			for (const event of events) {
				// Check for "on" event hooks
				if (keys.includes("on" + event)) {
					// Get the value of the event
					const value = WorldEvent[event as keyof typeof WorldEvent];

					// Get the handler from the plugin module
					const handler = (plugin.module as Record<string, unknown>)[
						"on" + event
					] as () => void;

					// Bind the handler to the plugin
					this.worlds.on(value, handler.bind(this));
				}

				// Check for "before" event hooks
				if (keys.includes("before" + event)) {
					// Get the value of the event
					const value = WorldEvent[event as keyof typeof WorldEvent];

					// Get the handler from the plugin module
					const handler = (plugin.module as Record<string, unknown>)[
						"before" + event
					] as () => boolean;

					// Bind the handler to the plugin
					this.worlds.before(value, handler.bind(this));
				}

				// Check for "after" event hooks
				if (keys.includes("after" + event)) {
					// Get the value of the event
					const value = WorldEvent[event as keyof typeof WorldEvent];

					// Get the handler from the plugin module
					const handler = (plugin.module as Record<string, unknown>)[
						"after" + event
					] as () => void;

					// Bind the handler to the plugin
					this.worlds.after(value, handler.bind(this));
				}
			}
		}

		// Get the server tps from the properties
		const tps = this.properties.getValue("server-tps") ?? 20;

		let lastTick = process.hrtime();

		// Create a ticking loop with default 50ms interval
		// Handle delta time and tick the world
		const tick = () => {
			// Check if the server is stopped
			if (this.stopped) return;

			// Get the current time
			const [seconds, nanoseconds] = process.hrtime(lastTick);
			const delta = seconds + nanoseconds / 1e9;

			// Check if the server should tick
			if (delta >= 1 / tps) {
				// Set the last tick to the current time
				lastTick = process.hrtime();

				// Calculate the delta time
				const deltaTick = delta * 1000;

				// Calculate the server tps
				this.ticks.push(Date.now());
				const threshold = Date.now() - 1000;
				this.ticks = this.ticks.filter((tick) => tick > threshold);
				this.tps = this.ticks.length;

				// Tick all the worlds
				for (const world of this.worlds.getAll())
					world.tick(Math.floor(deltaTick));

				// Increment the tick
				this.tick++;
			}

			setImmediate(tick);
		};

		// Start the worlds
		await this.worlds.start();
		await this.plugins.start(this);

		// Set the interval to the tick method
		tick();

		this.logger.info(
			`Serenity is now up and running on ${this.raknet.address}:${this.raknet.port}`
		);
	}

	/**
	 * Stops the server and all the plugins.
	 */
	public async stop(): Promise<void> {
		// Close the console interface
		this.console.interface.close();

		// Stop all the plugins & worlds
		await this.plugins.stop(this);
		await this.worlds.stop();

		// Stop the server
		this.stopped = true;

		// Stop the raknet instance
		process.nextTick(() => {
			this.raknet.stop();
		});
	}

	/**
	 * Gets a player by their network session.
	 * @param session The network session
	 * @returns The player or undefined if not found
	 */
	public getPlayer(session: NetworkSession): Player | undefined {
		return [...this.players.values()].find(
			(player) => player.session === session
		);
	}

	public getPlayers(): Array<Player> {
		return [...this.players.values()];
	}
}

export { Serenity };
