import { ChatTypes, Disconnect, Respawn, SetPlayerGameType, Text } from '@serenityjs/bedrock-protocol';
import type { DisconnectReason, Vec2f, Vec3f, RespawnState, Gamemode } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import type { MessageForm } from '../forms';
import type { Network, NetworkSession } from '../network';
import type { LoginTokenData } from '../types';
import type { Chunk, World } from '../world';
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
	public readonly forms: Map<number, (data: any) => void>;

	protected gamemode: Gamemode;

	public world: World;
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
		this.abilities = new Abilities(this);
		this.attributes = new Attributes(this);
		this.render = new Render(this.serenity, this);
		this.forms = new Map();
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
		return this.world.chunkManager.getChunk(this.position.x >> 4, this.position.z >> 4);
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

	public async sendMessageForm(form: MessageForm, callback: (data: boolean) => void): Promise<void> {
		// Send the form and wait for the response.
		// This will return the ID of the newly created form.
		const id = await this.session.sendModalFormRequest(form.toPayload());

		// Store the callback.
		this.forms.set(id, callback);
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
