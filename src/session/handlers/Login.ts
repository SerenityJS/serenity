import type { Login, Tokens } from '@serenityjs/protocol';
import { PlayStatus, PlayerStatus, ResourcePacksInfo } from '@serenityjs/protocol';
import fastJwt from 'fast-jwt';
import { Player } from '../../player';
import type { ClientData, IdentityData, LoginTokenData } from '../../types';
import type { NetworkSession } from '../NetworkSession';
import { SessionHandler } from './SessionHandler';

class LoginHandler extends SessionHandler {
	public static decoder = fastJwt.createDecoder();

	public static override handle(packet: Login, session: NetworkSession): void {
		// Decode the login tokens
		const data = this.decode(packet.tokens);

		// Create the player instance, and add it to the default world
		const player = new Player(session, data);
		this.serenity.defaultWorld.addPlayer(player);

		// TODO: Enable encryption, the public key is given in the tokens
		// This is with the ClientToSeverHandshake packet & the ServerToClientHandshake packet
		// But for now, we will just send the player the login status, this will skip the encryption
		const login = new PlayStatus();
		login.status = PlayerStatus.LoginSuccess;

		// Send the login status to the player
		session.send(login.serialize());

		// TODO: Eventually add supoort for resource packs, and maybe behavior packs
		// Now we can send the player the resource packs info
		const packs = new ResourcePacksInfo();
		packs.forceAccept = false;
		packs.hasScripts = false;
		packs.mustAccept = false;
		packs.resourcePacks = [];
		packs.behaviorPacks = [];
		packs.packLinks = [];

		// Send the resource packs info to the player
		return session.send(packs.serialize());
	}

	public static decode(tokens: Tokens): LoginTokenData {
		const clientData: ClientData = this.decoder(tokens.client);
		// Parse the identity chain data
		const chains: string[] = JSON.parse(tokens.identity).chain;
		// Decode the chains
		const decodedChains = chains.map((chain) => this.decoder(chain));
		// Contains displayName, xuid, identity uuid, etc.
		const identityData: IdentityData = decodedChains.find((chain) => chain.extraData !== undefined)?.extraData;
		// Public key for encryption
		const publicKey = decodedChains.find((chain) => chain.identityPublicKey !== undefined)?.identityPublicKey;

		return {
			clientData,
			identityData,
			publicKey,
		};
	}
}

export { LoginHandler };
