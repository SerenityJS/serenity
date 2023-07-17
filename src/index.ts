import process from 'node:process';
import { Server as RakNetServer } from 'raknet-native';
import { makeMotd } from '../../protocol';

interface ServerOptions {
	maxConnections: number;
	motd?: string;
}

class Server {
	public readonly protocolVersion = 594;
	public readonly minecraftVersion = '1.20.10';
	public readonly host: string;
	public readonly port: number;
	public readonly options: ServerOptions;
	public readonly raknet: RakNetServer;

	public constructor(host: string, port: number, options?: ServerOptions) {
		this.host = host;
		this.port = port;
		this.options = options ?? {
			maxConnections: 20,
		};
		this.raknet = new RakNetServer(this.host, this.port, {
			maxConnections: this.options.maxConnections,
			protocolVersion: this.protocolVersion,
		});
		this.setMotd(this.options.motd ?? '§aSerenityJS§r');
	}

	public async start(): Promise<void> {
		return this.raknet.listen();
	}

	public setMotd(motd: string): void {
		this.options.motd = motd;
		this.raknet.setOfflineMessage(
			makeMotd(
				motd,
				this.protocolVersion,
				this.minecraftVersion,
				0,
				20,
				'12345567',
				'SerenityJS',
				'Creative',
				1,
				this.port,
				this.port,
			),
		);
	}
}

export { Server };

const server = new Server('127.0.0.1', 19_132);
server
	.start()
	.then(() => {
		console.log('Server started!');
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});

server.raknet.on('encapsulated', (client) => {
	console.log(client);
});
