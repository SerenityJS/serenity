import {
	PlayStatus,
	Login,
	type LoginTokens,
	PlayerStatus,
	DisconnectReason,
	ResourcePacksInfo,
} from '@serenityjs/bedrock-protocol';
import fastJwt from 'fast-jwt';
import { DEFAULT_PLAYER_PROPERTIES, Player } from '../../player';
import type { ClientData, IdentityData, LoginTokenData } from '../../types';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class LoginHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = Login.ID;

	/**
	 * The decoder for the network handler.
	 */
	public static decoder = fastJwt.createDecoder();

	/**
	 * Handles the network handler.
	 *
	 * @param packet The packet.
	 * @param session The network session.
	 */
	public static override async handle(packet: Login, session: NetworkSession): Promise<void> {
		// Decode the tokens given by the client.
		// This contains the client data, identity data, and public key.
		// Along with the players XUID, display name, and uuid.
		const data = this.decode(packet.tokens);

		// Get the players xuid.
		const xuid = data.identityData.XUID;

		// Check if the xuid is smaller than 16 characters.
		// If so then the xuid is invalid.
		// Not sure if this is the best way to check if the xuid is valid, but it works for now.
		// Possibly add a xuid resolver in the future, but may leave that up to plugins.
		if (xuid.length < 16) {
			// Disconnect the player.
			return session.disconnect(
				'Failed to connect due to having an invalid Xuid. Make sure you are connected to Xbox Live before joining.',
				DisconnectReason.InvalidTenant,
			);
		}

		// Check if there is a player with the same xuid.
		// This would mean that the player is trying to login from another location.
		// Maybe add the ability to kick the player thats already logged in.
		const check = this.serenity.players.has(xuid);
		if (check) {
			// If there is, disconnect the player trying to connect.
			return session.disconnect('You are already logged in another location.', DisconnectReason.LoggedInOtherLocation);
		}

		// Get the player properties from the world provider.
		// And check if the xuid is the same as the xuid from the properties.
		// If not, this means that the player does not exist in the world provider.
		const world = this.serenity.getDefaultWorld();
		let properties = world.provider.readPlayerProperties(xuid);
		if (properties.xuid !== xuid) {
			const defaultProperties = DEFAULT_PLAYER_PROPERTIES;
			defaultProperties.xuid = xuid;
			defaultProperties.username = data.identityData.displayName;
			defaultProperties.uuid = data.identityData.identity;
			defaultProperties.position = world.getDefaultDimension().spawn;
			defaultProperties.dimension = world.getDefaultDimension().properties.identifier;

			// Write the default player properties to the world provider.
			world.provider.writePlayerProperties(xuid, defaultProperties);

			// Set the properties to the default properties.
			properties = defaultProperties;
		}

		// Create a new player instance.
		// Since we have gotten the players login data, we can create a new player instance.
		// We will also add the player to the players map.
		const player = new Player(session, data, properties, world);
		this.serenity.players.set(xuid, player);

		// TODO: Emit the login event.
		// Not sure how the event system will work yet, so this will be implemented later.

		// TODO: Enable encryption, the public key is given in the tokens
		// This is with the ClientToSeverHandshake packet & the ServerToClientHandshake packet
		// But for now, we will just send the player the login status, this will skip the encryption
		const login = new PlayStatus();
		login.status = PlayerStatus.LoginSuccess;

		// Send the login packet.
		await session.send(login);

		// TODO: Implement to ability to use resource packs.
		// We will now send an empty resource pack info packet.
		// This will tell the client that there are no resource packs to download for now.
		const packs = new ResourcePacksInfo();
		packs.mustAccept = false;
		packs.hasScripts = false;
		packs.forceServerPacks = false;
		packs.behaviorPacks = [];
		packs.texturePacks = [];
		packs.links = [];

		// We will now send the resource pack info packet.
		await session.send(packs);
	}

	public static decode(tokens: LoginTokens): LoginTokenData {
		// Contains data about the users client. (Device, game version, etc.)
		const clientData: ClientData = this.decoder(tokens.client);
		// Parse the identity chain data
		const chains: string[] = JSON.parse(tokens.identity).chain;
		// Decode the chains
		const decodedChains = chains.map((chain) => this.decoder(chain));
		// Contains mainly metadata, but also includes important XBL data (displayName, xuid, identity uuid, etc.)
		const identityData: IdentityData = decodedChains.find((chain) => chain.extraData !== undefined)?.extraData;
		// Public key for encryption
		// TODO: Implement encryption
		const publicKey = decodedChains.find((chain) => chain.identityPublicKey !== undefined)?.identityPublicKey;

		return {
			clientData,
			identityData,
			publicKey,
		};
	}
}

export { LoginHandler };
