import { EventEmitter } from 'node:events';
import fastJWT from 'fast-jwt';
import { DisconnectPacket } from '../../protocol';
import type { LoginToken } from '../../protocol';
import type { Client } from './Client';

// NOTE: Player should emit HIGH LEVEL events, while Client should emit LOW LEVEL events/packets.

class Player extends EventEmitter {
	public readonly client: Client;
	public readonly name: string;
	public readonly uuid: string;
	public readonly xuid: string;

	public constructor(client: Client, token: LoginToken) {
		super();
		this.client = client;
		const data = decodeLoginToken(token);
		if (!data) throw new Error('Invalid login token');
		this.name = data.displayName;
		this.uuid = data.uuid;
		this.xuid = data.xuid;
	}

	public disconnect(reason: string, hideScreen = false): void {
		// Packets need to be encrypted before sending.
		const packet = new DisconnectPacket(hideScreen, reason);
		this.client.send(packet.serialize());
	}
}

export { Player };

// TODO: move elsewhere.
interface LoginTokenData {
	clientData: any;
	displayName: string;
	identityPublicKey: string;
	uuid: string;
	xuid: string;
}

function decodeLoginToken(token: LoginToken): LoginTokenData | undefined {
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
