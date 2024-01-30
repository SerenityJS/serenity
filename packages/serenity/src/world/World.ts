import { MAPPED_BLOCK_STATES } from '@serenityjs/bedrock-data';
import { ChatTypes, Text, type DataPacket } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import type { Player } from '../player';
import { ChunkManager, BlockMapper } from './chunk';
import type { TerrainGenerator } from './generator';
import { BetterFlat } from './generator';

const RUNTIME_ID = 0n;

class World {
	protected readonly serenity: Serenity;
	protected readonly logger: Logger;

	public readonly name: string;
	public readonly seed: number;
	public readonly players: Map<bigint, Player>;
	public readonly chunkManager;

	public readonly mapper = new BlockMapper();

	public constructor(serenity: Serenity, name?: string, seed?: number, generator?: (that: World) => TerrainGenerator) {
		this.serenity = serenity;
		this.logger = new Logger('World', LoggerColors.Cyan);

		this.name = name ?? 'Serenity World';
		this.seed = seed ?? 0;
		this.players = new Map();
		this.chunkManager = new ChunkManager(
			this,
			generator?.(this) ?? BetterFlat.BasicFlat(this.mapper),
			this.mapper.getBlockPermutation('minecraft:air')!,
		);
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
		if (this.players.has(player.uniqueEntityId)) {
			return this.logger.error(`${player.username} (${player.xuid}) is already in the world!`);
		}

		// Render the player to all other players.
		for (const other of this.players.values()) {
			other.render.addPlayer(player);
		}

		// Render all other players to the player.
		for (const other of this.players.values()) {
			player.render.addPlayer(other);
		}

		// Set the player's world to this world.
		this.players.set(player.uniqueEntityId, player);

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
		if (!this.players.has(player.uniqueEntityId)) {
			return this.logger.error(`${player.username} (${player.xuid}) is not in the world!`);
		}

		// Remove the player from the players map.
		this.players.delete(player.uniqueEntityId);

		// Unrender the player from all other players.
		for (const other of this.players.values()) {
			other.render.removePlayer(player);
		}

		// Send the leave message to all players.
		return this.sendMessage(`§e${player.username} left the game.`);
	}

	/**
	 * Gets a chunk from the world.
	 *
	 * @param x The chunk X coordinate.
	 * @param z The chunk Z coordinate.
	 * @returns The chunk.
	 */ /*
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
	}*/

	/**
	 * Gets a block from the world.
	 *
	 * @param x The block X coordinate.
	 * @param y The block Y coordinate.
	 * @param z The block Z coordinate.
	 * @param block The block to set.
	 * @returns The chunk's setBlock index.
	 */ /*
	public setBlock(x: number, y: number, z: number, block: typeof Block): void {
		// Get the chunk.
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Return the chunk's setBlock index.
		return chunk.setBlock(x, y, z, block.getRuntimeId());
	}*/

	/**
	 * Gets a block from the world.
	 *
	 * @param x The block X coordinate.
	 * @param y The block Y coordinate.
	 * @param z The block Z coordinate.
	 * @returns The block.
	 */
	/// NEEDS a reimplementation
	/*
	public getBlock(x: number, y: number, z: number): typeof Block {
		// Get the chunk.
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Get the block runtime ID.
		const runtimeId = chunk.getBlock(x, y, z);

		// Get the block.
		// And check if the block is null or undefined.
		const block = this.mappings.getBlockByRuntimeId(runtimeId);
		if (!block) {
			this.logger.error(`Failed to get block instance at ${x}, ${y}, ${z}: ${runtimeId}`);

			// Return air.
			return Air;
		}

		// Return the block.
		return block;
	}*/

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
