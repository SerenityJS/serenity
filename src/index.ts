import { Buffer } from 'node:buffer';
import process from 'node:process';
import {
	framePackets,
	getPacketId,
	RequestNetworkSettingsPacket,
	NetworkSettingsPacket,
	CompressionAlgorithm,
	LoginPacket,
} from '../../protocol';
import { Server } from './Server';
import { getNativeObjectAsJsObject } from './utils';

const server = new Server('127.0.0.1', 19_132);

server.on('starting', (server) => {
	// No way to really tell when the server is open raknet native start
	// server returns a promise that resolves once the server closes
	console.log(`Starting server on ${server.host}:${server.port}!`);
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

			console.log('Recieved Login Packet from', client.guid);
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
