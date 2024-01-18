import { ChatTypes, PlayerList, RecordAction, Text, type DataPacket } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import type { Player } from '../player';
import { ChunkColumn } from './chunk';

class World {
	protected readonly serenity: Serenity;
	protected readonly logger: Logger;

	public readonly players: Map<bigint, Player>;
	public readonly chunks: Map<bigint, ChunkColumn>;

	public constructor(serenity: Serenity) {
		this.serenity = serenity;
		this.logger = new Logger('World', LoggerColors.Cyan);
		this.players = new Map();
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
		// If the chunk is not found, create a new chunk.
		// And add it to the chunks map.
		const chunk = this.chunks.has(hash) ? this.chunks.get(hash) : new ChunkColumn(x, z);
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
