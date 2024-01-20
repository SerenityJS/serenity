import {
	PROTOCOL_VERSION,
	MINECRAFT_VERSION,
	Packet,
	Disconnect,
	DisconnectReason,
} from '@serenityjs/bedrock-protocol';
import { Server } from '@serenityjs/raknet-server';
import { Logger } from './console';
import type { AbstractEvent } from './events';
import { SERENITY_EVENTS } from './events';
import type { NetworkPacketEvent } from './network';
import { Network, NetworkSession, NetworkStatus } from './network';
import { NETWORK_HANDLERS } from './network/handlers';
import type { Player } from './player';
import type { SerenityEvents, SerenityOptions } from './types';
import { EventEmitter } from './utils';
import { World } from './world';

class Serenity extends EventEmitter<SerenityEvents> {
	public readonly logger: Logger;
	public readonly server: Server;
	public readonly protocol: number;
	public readonly version: string;

	public readonly events: Map<string, AbstractEvent>;
	public readonly network: Network;
	public readonly players: Map<string, Player>;
	public readonly world: World; // This is temporary.

	public constructor(options: SerenityOptions) {
		super();

		Logger.DEBUG = options.debug ?? false;
		this.logger = new Logger('Serenity', '#a742f5');
		this.server = new Server(options.address, options.port);
		this.protocol = options.protocol ?? PROTOCOL_VERSION;
		this.version = options.version ?? MINECRAFT_VERSION;

		this.events = new Map();
		this.network = new Network(this);
		this.players = new Map();
		this.world = new World(this); // This is the default world.

		if (Logger.DEBUG) this.logger.info('Software is running in debug mode. Debug messages will now be shown.');

		// Register all events.
		// Loop through all events and construct them.
		// Bind the logic function to the packet hook
		for (const event of SERENITY_EVENTS) {
			// Attempt to construct the event.
			// If it fails, then we will log the error and continue.
			try {
				// Construct the event.
				const construct = new event(this);

				// Hook the logic method to the packet event.
				// Events will run after the packet has been handled.
				// This is to ensure that is the packet data has changed, the event will still run with the updated data.
				this.network.after(construct.packetHook, construct.logic.bind(construct) as never);

				// Add the event to the map.
				this.events.set(event.name, construct);
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
				status: NetworkStatus.Incoming,
			} as NetworkPacketEvent<Disconnect>;

			// Now we will emit the event.
			void this.network.emit(Packet.Disconnect, event);

			// Now we will trigger the disconnect handler.
			const handler = NETWORK_HANDLERS.find((x) => x.packet === Disconnect.ID);
			if (!handler) return this.logger.error('Failed to find disconnect handler.');
			void handler.handle(packet as never, session);

			// If there is a player instance, then we will remove it from the players map.
			// If there isn't, then we will just ignore it.
			const player = session.getPlayerInstance();
			if (player) this.players.delete(player.xuid);

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
		const start = this.server.start(this.protocol, this.version);
		if (!start) {
			this.logger.error(
				`Failed to start server on ${this.server.address}:${this.server.port}, make sure the port is not already in use or the server is not already running.`,
			);

			return false;
		}

		this.logger.info(`Started server on ${this.server.address}:${this.server.port}!`);

		return true;
	}
}

export { Serenity };
