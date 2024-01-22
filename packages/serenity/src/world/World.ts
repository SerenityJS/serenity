import {
	AddPlayer,
	ChatTypes,
	DeviceOS,
	Gamemode,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	PlayerList,
	RecordAction,
	Text,
	type DataPacket,
} from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import type { Player } from '../player';
import { ChunkColumn } from './chunk';
import type { Generator } from './generator';
import { Flat } from './generator';

/**
 * Represents a world.
 */
class World {
	protected readonly serenity: Serenity;
	protected readonly logger: Logger;

	public readonly players: Map<bigint, Player>;
	public readonly generator: Generator;
	public readonly chunks: Map<bigint, ChunkColumn>;

	public constructor(serenity: Serenity, generator?: Generator) {
		this.serenity = serenity;
		this.logger = new Logger('World', LoggerColors.Cyan);

		this.players = new Map();
		this.generator = generator ?? new Flat(this.serenity, 0); // TODO: Seed
		this.chunks = new Map();
	}

	/**
	 * Broadcasts a packet to all players.
	 *
	 * @param packets The packets to broadcast.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public async broadcast(...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const player of this.players.values()) {
			// Send the packet to that player.
			await player.session.send(...packets);
		}
	}

	/**
	 * Broadcasts a packet to all players except one.
	 *
	 * @param player The player to exclude.
	 * @param packets The packets to broadcast.
	 * @returns A promise that resolves when the packet has been sent.
	 */
	public async broadcastExcept(player: Player, ...packets: DataPacket[]): Promise<void> {
		// Loop through each player.
		for (const other of this.players.values()) {
			if (other === player) continue;

			// Send the packet to that player.
			await other.session.send(...packets);
		}
	}

	/**
	 * Adds a player to the world.
	 *
	 * @param player The player to add.
	 */
	public addPlayer(player: Player): void {
		// Check if the player is already in the world.
		if (this.players.has(player.uniqueId)) {
			return this.logger.error(`${player.username} (${player.xuid}) is already in the world!`);
		}

		// Send the player the player list.
		// Setting the type to add.
		// Mapping the player list to the player's data.
		let playerList = new PlayerList();
		playerList.action = RecordAction.Add;
		playerList.records = [...this.players.values()].map((entry) => ({
			uuid: entry.uuid,
			entityUniqueId: entry.uniqueId,
			username: entry.username,
			xuid: entry.xuid,
			platformChatId: '',
			buildPlatform: 0,
			skin: entry.skin.serialize(),
			isTeacher: false,
			isHost: false,
		}));

		// Send the player list to the player.
		void player.session.send(playerList);

		// Add the player to the players map.
		this.players.set(player.uniqueId, player);

		// Send a new player list add packet to all players.
		playerList = new PlayerList();
		playerList.action = RecordAction.Add;
		playerList.records = [
			{
				uuid: player.uuid,
				entityUniqueId: player.uniqueId,
				username: player.username,
				xuid: player.xuid,
				platformChatId: '',
				buildPlatform: 0,
				skin: player.skin.serialize(),
				isTeacher: false,
				isHost: false,
			},
		];

		const entity = new AddPlayer<any>();
		entity.uuid = player.uuid;
		entity.username = player.username;
		entity.runtimeId = player.runtimeId;
		entity.platformChatId = '';
		entity.position = player.position;
		entity.velocity = { x: 0, y: 0, z: 0 };
		entity.rotation = player.rotation;
		entity.headYaw = player.headYaw;
		entity.heldItem = {
			networkId: 0,
			count: null,
			metadata: null,
			hasStackId: null,
			stackId: null,
			blockRuntimeId: null,
			extras: null,
		};
		entity.gamemode = Gamemode.Creative;
		entity.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.AffectedByGravity,
			},
		];
		entity.properties = {
			ints: [],
			floats: [],
		};
		entity.uniqueEntityId = player.uniqueId;
		entity.premissionLevel = 2;
		entity.commandPermission = 0;
		entity.abilities = [];
		entity.links = [];
		entity.deviceId = 'Win10';
		entity.deviceOS = DeviceOS.Win10;

		// Send the packet to all players except the new player.
		void this.broadcastExcept(player, playerList);

		// Send the packet to the new player.
		void this.broadcastExcept(player, entity);

		// Send the join message to all players.
		return this.sendMessage(`§e${player.username} joined the game.`);
	}

	/**
	 * Removes a player from the world.
	 *
	 * @param player The player to remove.
	 */
	public removePlayer(player: Player): void {
		// Check if the player is not in the world.
		if (!this.players.has(player.uniqueId)) {
			return this.logger.error(`${player.username} (${player.xuid}) is not in the world!`);
		}

		// Remove the player from the players map.
		this.players.delete(player.uniqueId);

		// Send a new player list remove packet to all players.
		const playerList = new PlayerList();
		playerList.action = RecordAction.Remove;
		playerList.records = [
			{
				uuid: player.uuid,
			},
		];

		// Send the packet to all players.
		void this.broadcast(playerList);

		// Send the leave message to all players.
		return this.sendMessage(`§e${player.username} left the game.`);
	}

	/**
	 * Gets a chunk from the world.
	 *
	 * @param x The chunk X coordinate.
	 * @param z The chunk Z coordinate.
	 * @returns The chunk.
	 */
	public getChunk(x: number, z: number): ChunkColumn {
		// Create a hash for the chunk.
		const hash = ChunkColumn.getHash(x, z);

		// Get the chunk from the chunks map.
		// If the chunk is not found, create a new chunk using the generator.
		// And add it to the chunks map.
		const chunk = this.chunks.has(hash) ? this.chunks.get(hash) : this.generator.generateChunk(x, z);
		if (!this.chunks.has(hash)) this.chunks.set(hash, chunk!);

		// Return the chunk.
		return chunk!;
	}

	/**
	 * Gets a block from the world.
	 *
	 * @param x The block X coordinate.
	 * @param y The block Y coordinate.
	 * @param z The block Z coordinate.
	 * @param block The block to set.
	 * @returns The chunk's setBlock index.
	 */
	public setBlock(x: number, y: number, z: number, block: number): number {
		// Get the chunk.
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Return the chunk's setBlock index.
		return chunk.setBlock(x & 0xf, y & 0xf, z & 0xf, block);
	}

	/**
	 * Gets a block from the world.
	 *
	 * @param x The block X coordinate.
	 * @param y The block Y coordinate.
	 * @param z The block Z coordinate.
	 * @returns The block.
	 */
	public getBlock(x: number, y: number, z: number): number {
		// Get the chunk.
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Return the chunk's setBlock index.
		return chunk.getBlock(x & 0xf, y & 0xf, z & 0xf);
	}

	/**
	 * Sends a message to all players.
	 *
	 * @param message The message to send.
	 */
	public sendMessage(message: string): void {
		// Create a new text packet.
		const packet = new Text();

		// Assign the message to the packet.
		packet.type = ChatTypes.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = '';
		packet.platformChatId = '';

		// Send the packet to all players.
		void this.broadcast(packet);
	}
}

export { World };
