import type { Buffer } from 'node:buffer';
import { Packets } from '@serenityjs/protocol';
import type {
	RequestNetworkSettings,
	Login,
	ClientCacheStatus,
	ResourcePackClientResponse,
	RequestChunkRadius,
	TickSync,
} from '@serenityjs/protocol';
import { Raknet } from '@serenityjs/raknet.js';
import { Logger } from './logger';
import { Player } from './player';
import { EventEmitter } from './utils';

interface Packet {
	bin: Buffer;
	id: number;
}

interface SerenityEvents {
	ClientCacheStatus: [ClientCacheStatus, Player];
	Login: [Login, Player];
	PlayerConnected: [Player];
	PlayerDisconnected: [Player];
	RequestChunkRadius: [RequestChunkRadius, Player];
	RequestNetworkSettings: [RequestNetworkSettings, Player];
	ResourcePackClientResponse: [ResourcePackClientResponse, Player];
	TickSync: [TickSync, Player];
	buffer: [Packet, Player];
}

class Serenity extends EventEmitter<SerenityEvents> {
	public readonly logger: Logger;
	public readonly address: string;
	public readonly port: number;
	public readonly protocolVerison = 622;
	public readonly minecraftVersion = '1.20.40';
	public readonly raknet: Raknet;

	public readonly players: Map<bigint, Player>;

	public constructor(address: string, port: number) {
		super();
		this.logger = new Logger('Serenity');
		this.address = address;
		this.port = port;
		this.raknet = new Raknet(this.protocolVerison, this.minecraftVersion);
		this.raknet.motd = 'SerenityJS';
		this.players = new Map();
	}

	public start(): void {
		const socket = this.raknet.start(this.address, this.port);
		if (!socket) return this.logger.error(`Failed to start server on port "${this.port}"!`);
		socket
			.on('Listening', () => {
				this.logger.info(`Server is now listening on port "${this.port}" using protocol "${this.protocolVerison}"!`);
			})
			.on('ClientConnected', async (client) => {
				if (this.players.has(client.guid)) return;
				const player = new Player(this, client);
				this.players.set(client.guid, player);
				const value = await this.emit('PlayerConnected', player);
				if (value)
					return this.logger.info(
						`Player connected with guid "${client.guid}" from "${client.remote.address}:${client.remote.port}"!`,
					);
				return player.disconnect('Server rejected connection.'); // TODO: change
			})
			.on('ClientDisconnected', async (client) => {
				if (!this.players.has(client.guid)) return;
				const player = this.players.get(client.guid)!;
				this.players.delete(client.guid);
				this.logger.info(
					`Player disconnected with guid "${client.guid}" from "${client.remote.address}:${client.remote.port}"!`,
				);
				await this.emit('PlayerDisconnected', player);
			})
			.on('Encapsulated', async (buffer, client) => {
				if (!this.players.has(client.guid)) return;
				const player = this.players.get(client.guid)!;
				await player.incoming(buffer);
			})
			.on('Error', (error) => {
				console.log(error);
			});
	}
}

export { Serenity };
