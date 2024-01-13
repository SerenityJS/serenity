import { Server } from '@serenityjs/raknet-server';
import { Logger, LoggerColors } from './console';
import { Network, NetworkSession } from './network';
import type { Player } from './player';
import { EventEmitter } from './utils';

interface SerenityEvents {
	test: [];
}

class Serenity extends EventEmitter<SerenityEvents> {
	public readonly logger: Logger;
	public readonly server: Server;
	public readonly protocol: number;
	public readonly version: string;

	public readonly network: Network;
	public readonly players: Map<string, Player>;

	public constructor(protocol: number, version: string, address: string, port?: number, debug = false) {
		super();

		Logger.DEBUG = debug;
		this.logger = new Logger('Serenity', '#a742f5');
		this.server = new Server(address, port);
		this.protocol = protocol;
		this.version = version;

		this.network = new Network(this);
		this.players = new Map();

		if (debug) this.logger.info('Software is running in debug mode. Debug messages will now be shown.');
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

			// Get the session and attempt to get a player instance.
			// If there is a player instance, then we will remove it from the players map.
			// If there isn't, then we will just ignore it.
			const session = this.network.sessions.get(connection.guid)!;
			const player = session.getPlayerInstance();
			if (player) this.players.delete(player.xuid);

			// Emit the disconnect event.
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
