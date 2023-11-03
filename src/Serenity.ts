import type { Buffer } from 'node:buffer';
import { Raknet } from '@serenityjs/raknet.js';
import { Logger } from './logger';
import type { Player } from './player';
import { PlayerHandler } from './player';
import { NetworkSession, SessionHandler } from './session';
import { EventEmitter } from './utils';
import { World } from './world';

interface Packet {
	bin: Buffer;
	id: number;
}

interface SerenityEvents {
	packet: [Packet, NetworkSession, Player?];
}

class Serenity extends EventEmitter<SerenityEvents> {
	public readonly logger: Logger;
	public readonly address: string;
	public readonly port: number;
	public readonly protocolVerison = 622;
	public readonly minecraftVersion = '1.20.40';
	public readonly raknet: Raknet;

	public readonly worlds: Map<string, World> = new Map();
	public readonly defaultWorld: World;

	// public readonly players: Map<bigint, Player>;

	public readonly networkSessions: Map<bigint, NetworkSession> = new Map();

	public constructor(address: string, port: number) {
		super();
		this.logger = new Logger('Serenity');
		this.address = address;
		this.port = port;
		this.raknet = new Raknet(this.protocolVerison, this.minecraftVersion);
		this.raknet.motd = 'SerenityJS';

		this.defaultWorld = new World(this);
		this.worlds.set(this.defaultWorld.settings.getWorldName(), this.defaultWorld);

		// Set the handlers serenity instance
		SessionHandler.serenity = this;
		PlayerHandler.serenity = this;
	}

	public start(): void {
		this.raknet.start(this.address, this.port);
		if (!this.raknet) return this.logger.error(`Failed to start server on port "${this.port}"!`);
		this.logger.info(`Server is now listening on port "${this.port}" using protocol "${this.protocolVerison}"!`);

		// Handles the connection of a new player
		this.raknet.on('Connect', (session) => {
			if (this.networkSessions.has(session.guid))
				return this.logger.error(`Player connecting with guid "${session.guid}" is already connected!`);
			// Create a new session
			const networkSession = new NetworkSession(this, session);
			// Add the session to the map
			this.networkSessions.set(session.guid, networkSession);
		});

		// Handles the disconnection of a player
		this.raknet.on('Disconnect', (session) => {
			// Check if the player is connected
			if (!this.networkSessions.has(session.guid))
				return this.logger.error(`Player disconnecting with guid "${session.guid}" is not connected!`);
			// Get player session, and remove them from the world
			const worlds = [...this.worlds.values()];
			const player = worlds.find((world) => world.players.has(session.guid))?.players.get(session.guid);
			if (player) player.world.removePlayer(player);

			// Remove the session from the map
			this.networkSessions.delete(session.guid);
		});

		this.raknet.on('Encapsulated', async (session, buffer) => {
			// Check if the player is connected
			if (!this.networkSessions.has(session.guid))
				return this.logger.error(`Player sending packet with guid "${session.guid}" is not connected!`);
			// Get the session
			const networkSession = this.networkSessions.get(session.guid);
			// Check if the session exists
			if (!networkSession) return this.logger.error(`Player session with guid "${session.guid}" does not exist!`);
			// Let the session handle the packet
			await networkSession.incoming(buffer);
		});
	}

	public getPlayerFromNetworkSession(network: NetworkSession): Player | undefined {
		const worlds = [...this.worlds.values()];
		return worlds.find((world) => world.players.has(network.session.guid))?.players.get(network.session.guid);
	}
}

export { Serenity };
