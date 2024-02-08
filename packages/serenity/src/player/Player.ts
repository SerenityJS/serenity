import {
	ChangeDimension,
	ChatTypes,
	Disconnect,
	NetworkChunkPublisherUpdate,
	PlayStatus,
	PlayerStatus,
	Respawn,
	SetPlayerGameType,
	Text,
} from '@serenityjs/bedrock-protocol';
import type { DisconnectReason, Vec2f, Vec3f, RespawnState, Gamemode, FormType } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import type { MessageForm } from '../forms';
import type { Network, NetworkSession } from '../network';
import type { ActionFormResponse, LoginTokenData, MessageFormResponse } from '../types';
import type { Chunk, World, Dimension } from '../world';
import { Render } from './Render';
import { Abilities } from './abilities';
import { Attributes } from './attributes';
import { Skin } from './skin';

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
class Player {
	protected readonly serenity: Serenity;

	public readonly network: Network;
	public readonly session: NetworkSession;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly runtimeEntityId: bigint;
	public readonly uniqueEntityId: bigint;
	public readonly skin: Skin;
	public readonly abilities: Abilities;
	public readonly attributes: Attributes;
	public readonly render: Render;
	public readonly forms: Map<
		number,
		{ reject(value: Error): void; resolve(value: ActionFormResponse | MessageFormResponse): void; type: FormType }
	>;

	protected gamemode: Gamemode;
	protected world: World;
	protected dimension: Dimension;

	public position: Vec3f = { x: 0, y: 0, z: 0 };
	public rotation: Vec2f = { x: 0, z: 0 };
	public headYaw: number = 0;
	public onGround: boolean = false;

	/**
	 * Creates a new player.
	 *
	 * @param session The network session.
	 * @param tokens The login tokens.
	 */
	public constructor(session: NetworkSession, tokens: LoginTokenData, world?: World) {
		this.serenity = session.serenity;

		this.network = session.network;
		this.session = session;
		this.username = tokens.identityData.displayName;
		this.xuid = tokens.identityData.XUID;
		this.uuid = tokens.identityData.identity;
		this.guid = session.guid;
		this.runtimeEntityId = session.runtimeId;
		this.uniqueEntityId = session.uniqueId;
		this.skin = new Skin(tokens.clientData);

		this.world = world ?? this.serenity.world;
		this.gamemode = this.world.gamemode;
		this.dimension = this.world.getDimension('minecraft:overworld');

		this.abilities = new Abilities(this);
		this.attributes = new Attributes(this);
		this.render = new Render(this.serenity, this);
		this.forms = new Map();
	}

	public getWorld(): World {
		return this.world;
	}

	public setWorld(world: World): void {
		throw new Error('Player.setWorld is not implemented');
	}

	public getDimension(): Dimension {
		return this.dimension;
	}

	public setDimension(dimension: Dimension): void {
		this.dimension = dimension;

		const change = new ChangeDimension();
		change.dimension = dimension.type;
		change.position = dimension.spawnPosition;
		change.respawn = true;

		void this.session.send(change);

		this.render.chunks.clear();

		const chunks = this.dimension.getSpawnChunks();

		const update = new NetworkChunkPublisherUpdate();
		update.coordinate = this.dimension.spawnPosition;
		update.radius = this.dimension.viewDistance;
		update.savedChunks = chunks.map((chunk: Chunk) => {
			return {
				x: chunk.x,
				z: chunk.z,
			};
		});

		void this.session.send(update);

		for (const chunk of chunks) {
			this.render.sendChunk(chunk);
		}

		const status = new PlayStatus();
		status.status = PlayerStatus.PlayerSpawn;

		void this.session.send(status);
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
		// TODO: get the players current dimension.
		// Get the dimension.
		const dimension = this.world.getDimension('minecraft:overworld');

		// Return the chunk.
		return dimension.getChunk(this.position.x >> 4, this.position.z >> 4);
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
	public respawn(position: Vec3f, state: RespawnState): void {
		// Create a new respawn packet.
		const packet = new Respawn();

		// Assign the packet data.
		packet.position = position;
		packet.state = state;
		packet.runtimeEntityId = this.runtimeEntityId;

		// Send the packet.
		void this.session.send(packet);
	}

	/**
	 * Sets the player's gamemode.
	 *
	 * @param gamemode The gamemode to set.
	 */
	public setGamemode(gamemode: Gamemode): void {
		// Create a new set player game type packet.
		const packet = new SetPlayerGameType();

		// Assign the packet data.
		packet.gamemode = gamemode;

		// Send the packet.
		void this.session.send(packet);
	}

	/**
	 * Gets the player's gamemode.
	 *
	 * @returns The player's gamemode.
	 */
	public getGamemode(): Gamemode {
		return this.gamemode;
	}
}
export { Player };
