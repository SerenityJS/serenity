import type { Buffer } from 'node:buffer';
import { EventEmitter } from 'node:events';
import { inflateRawSync } from 'node:zlib';
import { Server as RakNetServer } from 'raknet-native';
import { makeMotd, unframePackets, getPacketId } from '../../protocol';
import { Client } from './Client';
import { unwrap } from './utils';

interface ServerOptions {
	maxConnections: number;
	motd?: string;
	onlinePlayers?: number;
}

interface Packet {
	bin: Buffer;
	id: number;
}

interface ServerEvents {
	binary: [Buffer, Client];
	packet: [Packet, Client];
	starting: [Server];
}
interface Server extends EventEmitter {
	addListener<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	emit<U extends keyof ServerEvents>(event: U, ...args: ServerEvents[U]): boolean;
	off<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	on<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	once<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	prependListener<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	prependOnceListener<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
	removeListener<U extends keyof ServerEvents>(event: U, listener: (...args: ServerEvents[U]) => void): this;
}

class Server extends EventEmitter {
	public readonly protocolVersion = 594;
	public readonly minecraftVersion = '1.20.10';
	public readonly host: string;
	public readonly port: number;
	public readonly raknet: RakNetServer;

	protected readonly options: ServerOptions;
	protected readonly clients: Map<string, Client> = new Map();

	public constructor(host: string, port: number, options?: ServerOptions) {
		super();
		this.host = host;
		this.port = port;
		this.options = options ?? {
			maxConnections: 20,
		};
		this.raknet = new RakNetServer(this.host, this.port, {
			maxConnections: this.options.maxConnections,
			protocolVersion: this.protocolVersion,
		});

		this.setMotd(this.options.motd ?? '§rSerenityJS§r');
		this.raknet.on('openConnection', (internal) => {
			const client = new Client(internal);
			this.clients.set(client.guid, client);
		});
		this.raknet.on('encapsulated', ({ buffer, address, guid }) => {
			console.log('buf', buffer);
			const client = this.clients.get(guid);
			if (!client) throw new Error('Client not found');
			this.emit('binary', buffer, client);
		});
		this.on('binary', (buffer, client) => {
			// TODO: should be handled by in protocol package.
			if (buffer[0] !== 0xfe) throw new Error('Invalid packet header!');
			const payload = buffer.slice(1);

			// Network settings request is never compressed
			// if the inflate fails we can assume its not deflated
			const inflated = unwrap(
				() => inflateRawSync(payload, { chunkSize: 512_000 }),
				() => payload,
			);

			const packets = unframePackets(inflated);

			for (const packet of packets) {
				const packetId = getPacketId(packet);
				this.emit('packet', { bin: packet, id: packetId }, client);
			}
		});
	}

	public async start(): Promise<void> {
		this.emit('starting', this);
		return this.raknet.listen();
	}

	public stop(): void {
		return this.raknet.close();
	}

	public getMotd(): string {
		return this.options.motd ?? '§rSerenityJS§r';
	}

	public setMotd(motd: string): void {
		this.options.motd = motd;
		const buffer = makeMotd(
			motd,
			this.protocolVersion,
			this.minecraftVersion,
			this.getOnlinePlayers(),
			this.getMaxPlayers(),
			'12345567',
			'SerenityJS',
			'Creative',
			1,
			this.port,
			this.port,
		);
		this.updateOffilineMessage(buffer);
	}

	public getMaxPlayers(): number {
		return this.options.maxConnections;
	}

	public setMaxPlayers(maxPlayers: number): void {
		this.options.maxConnections = maxPlayers;
		const buffer = makeMotd(
			this.getMotd(),
			this.protocolVersion,
			this.minecraftVersion,
			this.getOnlinePlayers(),
			maxPlayers,
			'12345567',
			'SerenityJS',
			'Creative',
			1,
			this.port,
			this.port,
		);
		this.updateOffilineMessage(buffer);
	}

	public getOnlinePlayers(): number {
		return this.options.onlinePlayers ?? 0;
	}

	public setOnlinePlayers(onlinePlayers: number): void {
		this.options.onlinePlayers = onlinePlayers;
		const buffer = makeMotd(
			this.getMotd(),
			this.protocolVersion,
			this.minecraftVersion,
			onlinePlayers,
			this.getMaxPlayers(),
			'12345567',
			'SerenityJS',
			'Creative',
			1,
			this.port,
			this.port,
		);
		this.updateOffilineMessage(buffer);
	}

	public updateOffilineMessage(buffer: Buffer): void {
		this.raknet.setOfflineMessage(buffer);
	}
}

export { Server };
