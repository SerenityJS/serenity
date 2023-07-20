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
import { Server } from './Server';
import { getNativeObjectAsJsObject } from './utils';

// Decodes login token from the client

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
			const tokenData = decodeLoginPacket(data.tokens);
			if (!tokenData) console.log('Failed to decode login packet');

			//  Decodes the login token from the client
			const token = client.startEncryption(tokenData!.identityPublicKey);

			console.log('Recieved Login Packet from', tokenData?.displayName, tokenData?.uuid, tokenData?.xuid);

			const serverToClientHandshake = new ServerToClientHandshakePacket(token);
			client.send(serverToClientHandshake.serialize());

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

interface LoginTokenData {
	clientData: any;
	displayName: string;
	identityPublicKey: string;
	uuid: string;
	xuid: string;
}

function decodeLoginPacket(token: LoginToken): LoginTokenData | undefined {
	const decode = fastJWT.createDecoder();
	const decodedJWT = decode(token.client);
	const chainData = JSON.parse(token.identity);

	for (const chain of chainData.chain) {
		const decodedChain = decode(chain);

		if (decodedChain.extraData) {
			return {
				displayName: decodedChain.extraData.displayName,
				identityPublicKey: decodedChain.identityPublicKey,
				uuid: decodedChain.extraData.identity,
				xuid: decodedChain.extraData.XUID,
				clientData: decodedJWT,
			};
		}
	}

	return undefined;
}
