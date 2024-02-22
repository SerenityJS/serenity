import type { DisconnectReason, RespawnState, FormType, Vector3f } from '@serenityjs/bedrock-protocol';
import { ChatTypes, Disconnect, Respawn, Text, Gamemode, SetPlayerGameType } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { Entity } from '../entity/index.js';
import type { Network, NetworkSession } from '../network/index.js';
import type { ActionFormResponse, LoginTokenData, MessageFormResponse } from '../types/index.js';
import type { Chunk, World, Dimension } from '../world/index.js';
import { Render } from './Render.js';
import { Abilities } from './abilities/index.js';
import { Attributes } from './attributes/index.js';
import { Skin } from './skin/Skin.js';

// NOTE
// STRUCTURE FOR PLAYER AND NEWORKSESSION CLASS
// Any methods that will directly interact with the player should be in the player class.
// Any methods that will NOT directly interact with the player should be in the network session class.
// The methods in the network session class should be used for reiceving packets from other players.
// For example, the player class has a sendMessage() method, this method will directly interact with the player, by sending a message on screen.
// Another example, the network session class has a receiveMovement() method, this method will NOT directly interact with the player,
// As this method handles the movement of other players, not the player itself.
//

/**
 * The player class.
 */
class Player extends Entity {
	protected readonly serenity: Serenity;

	public readonly network: Network;
	public readonly session: NetworkSession;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly skin: Skin;
	public readonly abilities: Abilities;
	public readonly attributes: Attributes;
	public readonly render: Render;
	public readonly forms: Map<
		number,
		{ reject(value: Error): void; resolve(value: ActionFormResponse | MessageFormResponse): void; type: FormType }
	>;

	public onGround: boolean = false;

	/**
	 * Creates a new player.
	 *
	 * @param session The network session.
	 * @param tokens The login tokens.
	 */
	public constructor(session: NetworkSession, tokens: LoginTokenData, dimension: Dimension) {
		super('minecraft:player', dimension, session.uniqueId);
		this.serenity = session.serenity;
		this.network = session.network;
		this.session = session;
		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = session.guid;
		this.skin = new Skin(tokens.clientData);
		this.abilities = new Abilities(this);
		this.attributes = new Attributes(this);
		this.render = new Render(this.serenity, this);
		this.forms = new Map();

		// Settting player metadata
		this.nametag = this.username;

		// Setting player properties
		this.gamemode = Gamemode.Creative;
	}

	public getWorld(): World {
		return this.dimension.world;
	}

	public getDimension(): Dimension {
		return this.dimension;
	}

	/**
	 * Gets the player's current gamemode.
	 */
	public get gamemode(): Gamemode {
		// Get the gamemode from the properties.
		const gamemode = this.properties.get('gamemode');

		// Return fallback if the gamemode is null.
		if (!gamemode) return Gamemode.Fallback;

		// Return the gamemode.
		return gamemode as Gamemode;
	}

	public set gamemode(gamemode: Gamemode) {
		// Create a new SetPlayerGameType packet.
		const packet = new SetPlayerGameType();

		// Assign the packet data.
		packet.gamemode = gamemode;

		// Send the packet.
		void this.session.send(packet);

		// Set the gamemode in the properties.
		this.properties.set('gamemode', gamemode);
	}

	/**
	 * Disconnects the player.
	 *
	 * @param message The message to send to the player.
	 * @param reason The reason for the disconnection.
	 * @param hideReason Whether or not to hide the disconnection screen.
	 */
	public disconnect(message: string, reason: DisconnectReason, hideReason = false): void {
		// Construct the disconnect packet.
		const packet = new Disconnect();

		// Assign the packet data.
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectionScreen = hideReason;

		// Send the packet.
		void this.session.send(packet);
	}

	/**
	 * Gets the player's current chunk.
	 *
	 * @returns The player's current chunk.
	 */
	public getCurrentChunk(): Chunk {
		// Return the chunk.
		return this.dimension.getChunk(this.position.x >> 4, this.position.z >> 4);
	}

	/**
	 * Sends a message to the player.
	 *
	 * @param message The message to send.
	 */
	public sendMessage(message: string): void {
		// Construct the text packet.
		const packet = new Text();

		// Assign the packet data.
		packet.type = ChatTypes.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = '';
		packet.platformChatId = '';

		// Send the packet.
		void this.session.send(packet);
	}

	/**
	 * Respawns the player.
	 *
	 * @param position The position to respawn the player at.
	 * @param state The respawn state.
	 */
	public respawn(position: Vector3f, state: RespawnState): void {
		// Create a new respawn packet.
		const packet = new Respawn();

		// Assign the packet data.
		packet.position = position;
		packet.state = state;
		packet.runtimeEntityId = this.runtimeId;

		// Send the packet.
		void this.session.send(packet);
	}
}
export { Player };
