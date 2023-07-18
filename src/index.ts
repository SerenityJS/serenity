import { Buffer } from 'node:buffer';
import process from 'node:process';
import fastJWT from 'fast-jwt';
import type { LoginToken } from '../../protocol';
import {
	framePackets,
	getPacketId,
	RequestNetworkSettingsPacket,
	NetworkSettingsPacket,
	CompressionAlgorithm,
	LoginPacket,
	ServerToClientHandshakePacket,
} from '../../protocol';
import { Player } from './Player';
import { Server } from './Server';
import { getNativeObjectAsJsObject } from './utils';

// Decodes login token from the client

const server = new Server('127.0.0.1', 19_132);

server.on('starting', (server) => {
	// No way to really tell when the server is open raknet native start
	// server returns a promise that resolves once the server closes
	console.log(`Starting server on ${server.host}:${server.port}!`);
	server.setMaxPlayers(100);
	server.setOnlinePlayers(13);
});

server.on('packet', ({ bin, id }, client) => {
	// console.log(`Received packet ${id} from ${client.guid}`);

	switch (id) {
		case RequestNetworkSettingsPacket.id(): {
			const networkSettings = new NetworkSettingsPacket(512, CompressionAlgorithm.Deflate, false, 0, 0);

			client.send(networkSettings.serialize());

			break;
		}

		case LoginPacket.id(): {
			const data = LoginPacket.deserialize(bin);

			// Check client protocol version with server protocol version
			// Player class probably shouldnt have a protocolVersion property, cause we want the client and server to match
			// Player class should not be created unless the protocol versions match
			// Also we need to start tracking the player instance with the client instance, once the player instance is created
			const player = new Player(client, data.tokens);

			console.log('Recieved Login Packet from', player.name, player.uuid, player.xuid);
			console.log(getNativeObjectAsJsObject(data));

			break;
		}

		default:
			return console.log(`Unhandled packet:`, id.toString(16));
	}
});

server
	.start()
	.then(() => {
		console.log('Server cleanup goes here.');
	})
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
