import { setTimeout } from 'node:timers';
import {
	PROTOCOL_VERSION,
	MINECRAFT_VERSION,
	Packet,
	Disconnect,
	DisconnectReason,
} from '@serenityjs/bedrock-protocol';
import { Server } from '@serenityjs/raknet-server';
import { ServerProperties } from './Properties.js';
import { Logger } from './console/index.js';
import type { AbstractEvent, Shutdown } from './events/index.js';
import { SERENITY_EVENTS } from './events/index.js';
import { NETWORK_HANDLERS } from './network/handlers/index.js';
import { Network, NetworkSession, NetworkBound } from './network/index.js';
import type { NetworkPacketEvent } from './network/index.js';
import { Plugins } from './plugin/index.js';
import type { WorldProvider } from './provider/index.js';
import type { WorldProperties, SerenityEvents, SerenityOptions } from './types/index.js';
import { HookMethod } from './types/index.js';
import { EventEmitter } from './utils/index.js';
import { World } from './world/index.js';

class Serenity extends EventEmitter<SerenityEvents> {
	protected interval: NodeJS.Timeout | null = null;

	public readonly logger: Logger;
	public readonly properties: ServerProperties;
	public readonly providers: Map<string, WorldProvider>;

	public readonly worlds: Map<string, World>;
	public readonly server: Server;
	public readonly protocol: number;
	public readonly version: string;
	public readonly events: Map<string, AbstractEvent>;
	public readonly network: Network;
	public readonly plugins: Plugins;

	/**
	 * Constructs a new serenity instance.
	 *
	 * @note If no options are provided, the default options will be pulled from the server.properties file.
	 * @param options - The options for the serenity instance.
	 */
	public constructor(options?: SerenityOptions) {
		super();
		this.logger = new Logger('Serenity', '#a742f5');

		this.logger.info('Server is now starting...');

		this.properties = new ServerProperties(this.logger);
		this.providers = new Map();
		Logger.DEBUG = options?.debug ?? this.properties.values.server.debug;
		this.worlds = new Map();
		this.server = new Server(
			options?.address ?? this.properties.values.server.address,
			options?.port ?? this.properties.values.server.port,
			options?.maxConnections ?? this.properties.values.server['max-connections'],
		);
		this.protocol = options?.protocol ?? PROTOCOL_VERSION;
		this.version = options?.version ?? MINECRAFT_VERSION;

		this.events = new Map();
		this.network = new Network(this);
		this.plugins = new Plugins(this);

		if (Logger.DEBUG) this.logger.debug('Software is running in debug mode. Debug messages will now be shown.');

		// Register all events.
		// Loop through all events and construct them.
		// Bind the logic function to the packet hook
		for (const event of SERENITY_EVENTS) {
			// Assign the serenity instance to the event.
			// This is so we can access the serenity instance from the event.
			event.serenity = this;

			try {
				// Hook the logic method to the packet event.
				// Events will either be before, on, or after the packet event.
				// This is to ensure that is the packet data has changed, the event will still run with the updated data.
				// this.network.after(construct.packetHook, construct.logic.bind(construct) as never);
				switch (event.method as HookMethod) {
					case HookMethod.Before:
						this.network.before(event.hook!, event.logic.bind(event) as never);
						break;
					case HookMethod.On:
						this.network.on(event.hook!, event.logic.bind(event) as never);
						break;
					case HookMethod.After:
						this.network.after(event.hook!, event.logic.bind(event) as never);
						break;
					default:
						// Custom logic events will not be hooked to any packet event.
						// This may be used for custom events that are not related to packet events.
						event.initialize();
						break;
				}

				// Add the event to the map.
				this.events.set(event.name, event);
			} catch (error) {
				this.logger.error(`Failed to register event ${event.name}!`);
				this.logger.error(error);
			}
		}
	}

	public start(): boolean {
		this.server.on('connect', (connection) => {
			// Check if the user is already connected.
			const check = this.network.sessions.has(connection.guid);

			// Return if they are.
			if (check) return this.logger.debug('Got connection request from already connected user', connection.guid);

			// Create a new session for the user.
			const session = new NetworkSession(this, connection);

			// Add the session to the network.
			return this.network.sessions.set(connection.guid, session);
		});

		this.server.on('disconnect', (connection) => {
			// Check if the user is connected.
			const check = this.network.sessions.has(connection.guid);

			// Return if they aren't.
			if (!check) return this.logger.debug('Got disconnection request from unconnected user', connection.guid);

			// Get the session from the network.
			const session = this.network.sessions.get(connection.guid)!;

			// Emit a dummy disconnect event.
			// This will be used for events to listen to.
			// First we will construct the packet.
			const packet = new Disconnect();
			packet.message = 'Player disconnected.';
			packet.reason = DisconnectReason.Disconnected;
			packet.hideDisconnectionScreen = true;

			// Then we will build the event.
			const event = {
				packet,
				session,
				bound: NetworkBound.Server,
			} as NetworkPacketEvent<Disconnect>;

			// Now we will emit the event.
			void this.network.emit(Packet.Disconnect, event);

			// Now we will trigger the disconnect handler.
			const handler = NETWORK_HANDLERS.find((x) => x.packet === Disconnect.ID);
			if (!handler) return this.logger.error('Failed to find disconnect handler.');
			void handler.handle(packet as never, session);

			// Remove the session from the network.
			return this.network.sessions.delete(connection.guid);
		});

		this.server.on('encapsulated', async (connection, buffer) => {
			const check = this.network.sessions.has(connection.guid);

			if (!check) return this.logger.debug('Got packet from unconnected user', connection.guid);

			const session = this.network.sessions.get(connection.guid)!;

			return this.network.incoming(session, buffer);
		});

		// Check if the server started successfully.
		const start = this.server.start(this.protocol, this.version, this.properties.values.server.motd);
		if (!start) {
			this.logger.error(
				`Failed to start server on ${this.server.address}:${this.server.port}, make sure the port is not already in use or the server is not already running.`,
			);

			return false;
		}

		this.logger.info(`Started server on ${this.server.address}:${this.server.port}!`);

		// TODO: Make better

		const tick = () =>
			setTimeout(() => {
				// Loop through each world.
				for (const world of this.worlds.values()) {
					world.tick();
				}

				tick();
			}, 50);

		this.interval = tick().unref();

		return true;
	}

	public stop(reason?: string): void {
		const shutdown = this.events.get('Shutdown') as typeof Shutdown;

		shutdown.logic(1, reason ?? 'Server is now shutting down...').catch((error) => {});
	}

	/**
	 * Gets a world provider from the serenity instance.
	 * If no identifier is provided, the default provider set in the "server.properties" file will be returned.
	 *
	 * @param identifier - The identifier of the provider to get.
	 * @returns The provider.
	 */
	public getProvider(identifier?: string): WorldProvider {
		return this.providers.get(identifier ?? this.properties.values.world.provider)!;
	}

	/**
	 * Register a new world provider to the serenity instance.
	 *
	 * @param provider - The provider to register.
	 */
	public registerProvider(provider: typeof WorldProvider): WorldProvider {
		// Check if the provider is already registered.
		if (this.providers.has(provider.identifier)) {
			this.logger.error(`Failed to register provider, provider identifier [${provider.identifier}] already exists!`);

			return this.providers.get(provider.identifier)!;
		}

		// Construct the provider.
		const instance = new provider(this);

		// Add the provider to the map.
		this.providers.set(provider.identifier, instance);

		// Return the provider.
		return instance;
	}

	/**
	 * Unregister a world provider from the serenity instance.
	 *
	 * @param identifier - The identifier of the provider to unregister.
	 */
	public unregisterProvider(identifier: string): void {
		// Check if the provider is already registered.
		if (!this.providers.has(identifier)) {
			this.logger.error(`Failed to unregister provider, provider identifier [${identifier}] does not exist!`);

			return;
		}

		// Remove the provider from the map.
		this.providers.delete(identifier);
	}

	/**
	 * Get a world from the serenity instance.
	 * If no name is provided, the default world provided in the "server.properties" file will be returned.
	 *
	 * @param name - The world name.
	 * @returns The world.
	 */
	public getWorld(name?: string): World {
		return this.worlds.get(name ?? this.properties.values.world.default)!;
	}

	/**
	 * Register a new world to the serenity instance.
	 *
	 * @param name - The name of the world to register.
	 * @param provider - The provider of the world.
	 * @param properties - The properties of the world.
	 * @returns The provider.
	 */
	public registerWorld(name: string, provider: WorldProvider, properties?: WorldProperties): World {
		// Check if the world is already registered.
		if (this.worlds.has(name)) {
			this.logger.error(`Failed to register world, world name [${name}] already exists!`);

			return this.worlds.get(name)!;
		}

		// Construct the world.
		const instance = new World(name, provider, properties);

		// Add the world to the map.
		this.worlds.set(name, instance);

		// Return the world.
		return instance;
	}

	/**
	 * Unregister a world from the serenity instance.
	 *
	 * @param name - The name of the world to unregister.
	 */
	public unregisterWorld(name: string): void {
		// Check if the world is already registered.
		if (!this.worlds.has(name)) {
			this.logger.error(`Failed to unregister world, world name [${name}] does not exist!`);

			return;
		}

		// Remove the world from the map.
		this.worlds.delete(name);
	}
}

export { Serenity };
