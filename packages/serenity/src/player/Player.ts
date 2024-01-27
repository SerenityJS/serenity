import type { DisconnectReason, Vec2f, Vec3f } from '@serenityjs/bedrock-protocol';
import { Disconnect } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import type { Network, NetworkSession } from '../network';
import type { LoginTokenData } from '../types';
import type { ChunkColumn, World } from '../world';
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
	public readonly runtimeId: bigint;
	public readonly uniqueEntityId: bigint;
	public readonly skin: Skin;
	public readonly abilities: Abilities;
	public readonly attributes: Attributes;
	public readonly render: Render;

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
		this.runtimeId = session.runtimeId;
		this.uniqueEntityId = session.uniqueId;
		this.skin = new Skin(tokens.clientData);
		this.world = world ?? this.serenity.world;
		this.abilities = new Abilities(this);
		this.attributes = new Attributes(this);
		this.render = new Render(this.serenity, this);
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
	public getCurrentChunk(): ChunkColumn {
		return this.world.getChunk(this.position.x >> 4, this.position.z >> 4);
	}
}
export { Player };
