import type { DisconnectReason, RespawnState, FormType, Vector3f } from '@serenityjs/bedrock-protocol';
import {
	ChatTypes,
	Disconnect,
	Respawn,
	Text,
	Gamemode,
	SetPlayerGameType,
	LevelChunk,
	NetworkChunkPublisherUpdate,
} from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { EntityAttributeComponent } from '../entity/components/attributes/Attribute.js';
import { Entity } from '../entity/index.js';
import type { Network, NetworkSession } from '../network/index.js';
import type { ActionFormResponse, LoginTokenData, MessageFormResponse, PlayerComponents } from '../types/index.js';
import { Chunk } from '../world/index.js';
import type { Dimension } from '../world/index.js';
import { type PlayerComponent, type PlayerAttributeComponent, PlayerAbilityComponent } from './components/index.js';
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
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	public readonly network: Network;
	public readonly session: NetworkSession;
	public readonly username: string;
	public readonly xuid: string;
	public readonly uuid: string;
	public readonly guid: bigint;
	public readonly skin: Skin;
	public readonly components: Map<string, PlayerComponent>;
	public readonly chunks: Map<bigint, boolean>;
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
		this.components = new Map();
		this.chunks = new Map();
		this.forms = new Map();

		// Settting player metadata
		this.nametag = this.username;

		// Setting player properties
		this.gamemode = Gamemode.Survival;
	}

	/**
	 * Fired when the server ticks.
	 */
	public tick(): void {
		// Get the chunks that are not rendered.
		const chunks = [...this.chunks.entries()].filter(([, rendered]) => !rendered);
		const coords = chunks.map(([hash]) => Chunk.fromHash(hash));

		// Check if there are chunks to render.
		if (chunks.length > 0) {
			// Create a new NetworkChunkPublisherUpdate packet.
			const packet = new NetworkChunkPublisherUpdate();

			// Assign the packet data.
			packet.radius = this.dimension.viewDistance;
			packet.coordinate = this.position.floor();
			packet.savedChunks = coords;

			// Send the packet to the player.
			this.session.send(packet);

			// Set the chunks to rendered.
			for (const [hash] of chunks) this.chunks.set(hash, true);
		}
	}

	/**
	 * Gets the component from the player.
	 *
	 * @param type - The type of the component.
	 * @returns The component.
	 */
	public getComponent<T extends keyof PlayerComponents>(type: T): PlayerComponents[T] {
		return this.components.get(type) as PlayerComponents[T];
	}

	/**
	 * Sets the component to the player.
	 *
	 * @param component - The component to set.
	 */
	public setComponent<T extends keyof PlayerComponents>(component: PlayerComponents[T]): void {
		this.components.set(component.type, component);
	}

	/**
	 * Gets the player's attribute components.
	 *
	 * @returns The player's attribute components.
	 */
	public getAttributes(): PlayerAttributeComponent[] {
		// Filter the components to only include the entity attribute components.
		return [...this.components.values()].filter(
			(component) => component instanceof EntityAttributeComponent,
		) as PlayerAttributeComponent[];
	}

	/**
	 * Gets the player's ability components.
	 *
	 * @returns The player's ability components.
	 */
	public getAbilities(): PlayerAbilityComponent[] {
		return [...this.components.values()].filter(
			(component) => component instanceof PlayerAbilityComponent,
		) as PlayerAbilityComponent[];
	}

	/**
	 * Send chunks to the player.
	 * This method will only send the chunks, it will not render them.
	 *
	 * @param chunks - The chunks to send.
	 */
	public sendChunk(...chunks: Chunk[]): void {
		// Prepare an array to store the LevelChunk packets.
		const packets: LevelChunk[] = [];

		// Loop through the chunks.
		for (const chunk of chunks) {
			// Check if the chunk is already rendered.
			if (this.chunks.has(chunk.getHash())) continue;

			// Add the chunk to the chunks map.
			// And set it to false, as it has not been rendered yet.
			this.chunks.set(chunk.getHash(), false);

			// Construct a new LevelChunk packet.
			const packet = new LevelChunk();

			// Assign the packet data.
			packet.x = chunk.x;
			packet.z = chunk.z;
			packet.dimension = this.dimension.type;
			packet.subChunkCount = chunk.getSubChunkSendCount();
			packet.cacheEnabled = false;
			packet.data = chunk.serialize();

			// Add the packet to the array.
			packets.push(packet);
		}

		// Send the packets to the player.
		this.session.send(...packets);
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
		this.session.send(packet);

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
		this.session.send(packet);
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
		this.session.send(packet);
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
		this.session.send(packet);
	}
}
export { Player };
