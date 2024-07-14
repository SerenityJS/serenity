import {
	DisconnectReason,
	LoginPacket,
	type LoginTokens,
	PlayStatus,
	PlayStatusPacket,
	ResourcePacksInfoPacket,
	SerializedSkin,
	SkinImage,
	TexturePackInfo
} from "@serenityjs/protocol";
import { createDecoder } from "fast-jwt";
import {
	type ClientData,
	type IdentityData,
	type LoginTokenData,
	Player
} from "@serenityjs/world";
import { Reliability } from "@serenityjs/raknet";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

/**
 * Handles the login packet.
 */
class Login extends SerenityHandler {
	public static packet = LoginPacket.id;

	/**
	 * The decoder instance for the login packet.
	 */
	public static decoder = createDecoder();

	public static handle(packet: LoginPacket, session: NetworkSession): void {
		// Decode the tokens given by the client.
		// This contains the client data, identity data, and public key.
		// Along with the players XUID, display name, and uuid.
		const data = this.decode(packet.tokens);

		// Get the clients xuid and username.
		const xuid = data.identityData.XUID;
		const username = data.identityData.displayName;

		// TODO: This is a temporary solution to the reliability and channel issue.
		session.reliablity = Reliability.UnreliableSequenced;

		// Check if the xuid is smaller than 16 characters.
		// If so then the xuid is invalid.
		// Not sure if this is the best way to check if the xuid is valid, but it works for now.
		// Possibly add a xuid resolver in the future, but may leave that up to plugins.
		if (xuid.length < 16) {
			// Disconnect the player.
			return session.disconnect(
				"Failed to connect due to having an invalid xuid. Make sure you are connected to Xbox Live before joining the server.",
				DisconnectReason.InvalidTenant
			);
		}

		// Check if the player is already connected.
		// And if so, disconnect the player the player currently connected.
		if (this.serenity.players.has(xuid)) {
			// Get the player to disconnect.
			const player = this.serenity.players.get(xuid) as Player;

			// Disconnect the player.
			player.session.disconnect(
				"You have been disconnected from the server because you logged in from another location.",
				DisconnectReason.LoggedInOtherLocation
			);
		}

		// Get the default world, and check if it is undefined.
		// If so, then disconnect the player.
		const world = this.serenity.worlds.get();
		if (!world)
			return session.disconnect(
				"There are no worlds registered within the server process.",
				DisconnectReason.WorldCorruption
			);

		// Get the default dimension, and check if it is undefined.
		// If so, then disconnect the player.
		const dimension = world.getDimension();
		if (!dimension)
			return session.disconnect(
				"There are no dimensions registered within the world instance.",
				DisconnectReason.WorldCorruption
			);

		// Get the permission level of the player.
		const permission = this.serenity.permissions.get(xuid, username);

		const {
			SkinId,
			PlayFabId,
			SkinResourcePatch,
			SkinImageWidth,
			SkinImageHeight,
			SkinData,
			CapeImageWidth,
			CapeImageHeight,
			CapeData,
			SkinGeometryData,
			SkinGeometryDataEngineVersion,
			SkinAnimationData,
			CapeId,
			ArmSize,
			SkinColor,
			PremiumSkin,
			PersonaSkin,
			CapeOnClassicSkin,
			TrustedSkin,
			OverrideSkin
		} = data.clientData;

		const skinImage = new SkinImage(SkinImageWidth, SkinImageHeight, SkinData);
		const capeImage = new SkinImage(CapeImageWidth, CapeImageHeight, CapeData);

		const skin = new SerializedSkin(
			SkinId,
			PlayFabId,
			SkinResourcePatch,
			skinImage,
			[],
			capeImage,
			SkinGeometryData,
			SkinGeometryDataEngineVersion,
			SkinAnimationData,
			CapeId,
			SkinId,
			ArmSize,
			SkinColor,
			[],
			[],
			PremiumSkin,
			PersonaSkin,
			CapeOnClassicSkin,
			TrustedSkin,
			OverrideSkin
		);

		// Create a new player instance.
		// Since we have gotten the players login data, we can create a new player instance.
		// We will also add the player to the players map.
		const player = new Player(session, data, dimension, permission, skin);
		this.serenity.players.set(xuid, player);

		// TODO: Enable encryption, the public key is given in the tokens
		// This is with the ClientToSeverHandshake packet & the ServerToClientHandshake packet
		// But for now, we will just send the player the login status, this will skip the encryption
		const login = new PlayStatusPacket();
		login.status = PlayStatus.LoginSuccess;

		const packs = new ResourcePacksInfoPacket();
		packs.mustAccept = this.serenity.resourcePacks.mustAcceptResourcePacks;

		packs.hasAddons = false;
		packs.hasScripts = false;
		packs.behaviorPacks = [];

		packs.forceServerPacks = false; // What this does is unknown.

		packs.texturePacks = [];
		for (const pack of this.serenity.resourcePacks.getPacks()) {
			const packInfo = new TexturePackInfo(
				pack.uuid,
				pack.contentKey,
				pack.hasScripts,
				pack.isRtx,
				pack.originalSize,
				pack.selectedSubpack,
				pack.uuid,
				pack.version
			);

			packs.texturePacks.push(packInfo);
		}

		packs.links = []; // TODO: CDN links (can these be provided alongside?)

		// Send the player the login status packet and the resource pack info packet.
		session.send(login, packs);
	}

	public static decode(tokens: LoginTokens): LoginTokenData {
		// Contains data about the users client. (Device, game version, etc.)
		const clientData: ClientData = this.decoder(tokens.client);

		// Parse the identity chain data
		const chains: Array<string> = JSON.parse(tokens.identity).chain;

		// Decode the chains
		const decodedChains = chains.map((chain) => this.decoder(chain));

		// Contains mainly metadata, but also includes important XBL data (displayName, xuid, identity uuid, etc.)
		const identityData: IdentityData = decodedChains.find(
			(chain) => chain.extraData !== undefined
		)?.extraData;

		// Public key for encryption
		// TODO: Implement encryption
		const publicKey = decodedChains.find(
			(chain) => chain.identityPublicKey !== undefined
		)?.identityPublicKey;

		return {
			clientData,
			identityData,
			publicKey
		};
	}
}

export { Login };
