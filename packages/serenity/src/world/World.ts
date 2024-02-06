import { ChatTypes, Gamemode, Text } from '@serenityjs/bedrock-protocol';
import type { DimensionType, DataPacket } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import { Player } from '../player';
import { BlockMapper } from './chunk';
import { Dimension } from './dimension';
import type { TerrainGenerator } from './generator';

class World {
	protected readonly serenity: Serenity;
	protected readonly dimensions: Map<string, Dimension>;

	public readonly logger: Logger;
	public readonly name: string;
	public readonly seed: number;
	public readonly players: Map<bigint, Player>;
	public readonly blocks: BlockMapper;

	public gamemode: Gamemode = Gamemode.Survival;

	public constructor(serenity: Serenity, name?: string, seed?: number) {
		this.serenity = serenity;
		this.logger = new Logger('World', LoggerColors.Cyan);
		this.dimensions = new Map();

		this.name = name ?? 'Serenity World';
		this.seed = seed ?? 0;
		this.players = new Map();
		this.blocks = new BlockMapper();
	}

	/**
	 * Get a dimension from the world.
	 *
	 * @param name The dimension name.
	 * @returns The dimension.
	 */
	public getDimension(name: string): Dimension {
		return this.dimensions.get(name) ?? this.dimensions.get('minecraft:overworld')!;
	}

	public registerDimension(type: DimensionType, identifier: string, generator: TerrainGenerator): void {
		if (this.dimensions.has(identifier)) {
			return this.logger.error(`Failed to register dimension, dimension identifier [${identifier}] already exists!`);
		}

		this.dimensions.set(identifier, new Dimension(this, type, identifier, generator));
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

	public spawnEntity(entity: Player | any, dimension?: Dimension): void {
		// Check if the entity is a player
		if (entity instanceof Player) {
			// Check if the player is already in the dimension
			if (this.players.has(entity.uniqueEntityId)) {
				return this.logger.error(`${entity.username} (${entity.xuid}) is already in the world!`);
			}

			// Set the player's world to this world.
			this.players.set(entity.uniqueEntityId, entity);

			// Add the player to the dimension.
			(dimension ?? entity.getDimension()).spawnEntity(entity);
		}
	}

	public despawnEntity(entity: Player | any, dimension?: Dimension): void {
		// Check if the entity is a player
		if (entity instanceof Player) {
			// Check if the player is not in the dimension
			if (!this.players.has(entity.uniqueEntityId)) {
				return this.logger.error(`${entity.username} (${entity.xuid}) is not in the world!`);
			}

			// Remove the player from the dimension.
			(dimension ?? entity.getDimension()).despawnEntity(entity);

			// Remove the player from the players map.
			this.players.delete(entity.uniqueEntityId);
		}
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
