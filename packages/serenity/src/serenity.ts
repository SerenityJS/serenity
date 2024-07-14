import { Logger, LoggerColors } from "@serenityjs/logger";
import { Server } from "@serenityjs/raknet";
import { Network, type NetworkSession } from "@serenityjs/network";
import Emitter from "@serenityjs/emitter";
import { Plugins } from "@serenityjs/plugins";

import { SerenityHandler, HANDLERS } from "./handlers";
import { Properties } from "./properties";
import { ResourcePackManager } from "./resource-packs/resource-pack-manager";
import {
	EVENT_SIGNALS,
	EventPriority,
	type EventSignal,
	type EventSignals
} from "./events";
import { Worlds } from "./worlds";
import { DEFAULT_SERVER_PROPERTIES } from "./properties/default";
import { Permissions } from "./permissions";
import { Console } from "./commands";

import type { DataPacket } from "@serenityjs/protocol";
import type { DefaultServerProperties } from "./types";
import type { Player } from "@serenityjs/world";

class Serenity extends Emitter<EventSignals> {
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
	 * A collective registry of all events.
	 */
	public readonly events: Map<string, EventSignal>;

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
	 * The server tick interval
	 */
	public interval: NodeJS.Timeout | null = null;

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
		super();

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
		this.events = new Map();

		this.resourcePacks = new ResourcePackManager(
			"./resource_packs",
			this.properties.values["resource-packs"],
			this.properties.values["must-accept-packs"]
		);

		// Set the Serenity instance for all handlers and event signals
		SerenityHandler.serenity = this;

		// Load all the event signals
		for (const signal of EVENT_SIGNALS) {
			// Apply the event signal priority
			// This will corrispond to the incoming packet priority
			switch (signal.priority as EventPriority) {
				default: {
					// If no priority is set, check if the signal has a hook
					// If so we will set the priority to "During"
					if (signal.hook) {
						this.network.on(signal.hook, signal.logic.bind(signal) as never);
					}
					break;
				}

				case EventPriority.Before: {
					// If the priority is set to "Before"
					// We will bind the signal logic to the network event before it is handled
					this.network.before(signal.hook, signal.logic.bind(signal) as never);
					break;
				}

				case EventPriority.After: {
					// If the priority is set to "After"
					// We will bind the signal logic to the network event after it is handled
					this.network.after(signal.hook, signal.logic.bind(signal) as never);
					break;
				}

				case EventPriority.During: {
					// If the priority is set to "During"
					// We will bind the signal logic to the network event
					this.network.on(signal.hook, signal.logic.bind(signal) as never);
					break;
				}
			}

			// Set the Serenity instance for the event signal
			signal.serenity = this;

			// Set the signal in the events map
			this.events.set(signal.name, signal);
		}

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
		// Initialize the worlds
		await this.worlds.initialize();
		await this.plugins.initialize(this);

		// Start the raknet instance.
		this.raknet.start();

		// Get the server tps from the properties
		const tps = this.properties.getValue("server-tps") ?? 20;

		// Create a ticking loop with default 50ms interval
		// Handle delta time and tick the world
		const tick = () =>
			setTimeout(
				() => {
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
					for (const world of this.worlds.getAll()) world.tick();

					// Increment the tick
					this.tick++;

					// TODO: ??? Maybe find a better solution?
					if (this.tick % 100 === 0 && this.connecting.size > 0) {
						for (const [session, packets] of this.connecting) {
							session.sendImmediate(...packets);
						}
					}

					// Tick the server
					tick();
				},
				1000 / tps - 10
			);

		// Start the ticking loop
		this.interval = tick().unref();

		// Start the worlds
		await this.worlds.start();
		await this.plugins.start(this);

		this.logger.info(
			`Serenity is now up and running on ${this.raknet.address}:${this.raknet.port}`
		);
	}

	/**
	 * Stops the server and all the plugins.
	 */
	public async stop(): Promise<void> {
		// Stop all the plugins & worlds
		await this.plugins.stop(this);
		await this.worlds.stop();

		// Clear the ticking interval
		if (this.interval) clearInterval(this.interval);

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
