import { Server } from '@serenityjs/raknet-server';
import { Network, NetworkSession } from './network';
import { EventEmitter } from './utils';

interface SerenityEvents {
	error: [Error | any];
}

class Serenity extends EventEmitter<SerenityEvents> {
	public readonly server: Server;
	public readonly protocol: number;
	public readonly version: string;

	public readonly network: Network;

	public constructor(protocol: number, version: string, address: string, port?: number) {
		super();

		this.server = new Server(address, port);
		this.protocol = protocol;
		this.version = version;

		this.network = new Network(this);
	}

	public start(): void {
		this.server.on('connect', (connection) => {
			// Check if the user is already connected.
			const check = this.network.sessions.has(connection.guid);

			// Return if they are.
			if (check) return console.log('Got connection request from already connected user', connection.guid);

			// Create a new session for the user.
			const session = new NetworkSession(this, connection);

			// Add the session to the network.
			return this.network.sessions.set(connection.guid, session);
		});

		this.server.on('disconnect', (connection) => {
			// Check if the user is connected.
			const check = this.network.sessions.has(connection.guid);

			// Return if they aren't.
			if (!check) return console.log('Got disconnection request from unconnected user', connection.guid);

			// Get the session.
			const session = this.network.sessions.get(connection.guid)!;

			// Emit the disconnect event.
			return this.network.sessions.delete(connection.guid);
		});

		this.server.on('encapsulated', async (connection, buffer) => {
			const check = this.network.sessions.has(connection.guid);

			if (!check) return console.log('Got packet from unconnected user', connection.guid);

			const session = this.network.sessions.get(connection.guid)!;

			return this.network.incoming(session, buffer);
		});

		this.server.start(this.protocol, this.version);
	}
}

export { Serenity };
export * from './network';
