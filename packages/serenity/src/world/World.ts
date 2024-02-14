import { ChatTypes, Gamemode, Text } from '@serenityjs/bedrock-protocol';
import type { DimensionType, DataPacket } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { Logger, LoggerColors } from '../console';
import { Player } from '../player';
import type { DimensionProperties, WorldProperties } from '../types';
import { WorldNetwork } from './Network';
import { BlockMapper } from './chunk';
import { Dimension } from './dimension';
import type { TerrainGenerator } from './generator';
import type { Provider } from './provider';

class World {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	/**
	 * This is the provider for the world, it handles reading and writing the world data.
	 */
	public readonly provider: Provider;

	/**
	 * The world network handles the sending and receiving of packets for the world.
	 */
	public readonly network: WorldNetwork;

	/**
	 * These values are found in the world.properties file in the world directory.
	 *
	 * @note These values are cached and should be updated using the `provider` instance when the world saves.
	 */
	public readonly properties: WorldProperties;

	/**
	 * The logger for the world.
	 */
	public readonly logger: Logger;

	/**
	 * The block mapper for the world, which maps the permutated block states to their respective block states.
	 */
	public readonly blocks: BlockMapper;

	/**
	 * The dimensions in the world mapped by their identifier.
	 */
	public readonly dimensions: Map<string, Dimension>;

	/**
	 * The players in the world mapped by their raknet guid.
	 */
	public readonly players: Map<bigint, Player>;

	public gamemode: Gamemode = Gamemode.Survival;

	public constructor(serenity: Serenity, provider: Provider) {
		this.serenity = serenity;
		this.provider = provider;
		this.network = new WorldNetwork(this);
		this.properties = provider.readProperties();
		this.logger = new Logger(this.properties.name, '#34eb92');
		this.blocks = new BlockMapper(this);
		this.dimensions = new Map();
		this.players = new Map();
	}

	// TODO: move this to the provider, as writeAdd or something
	public save(): void {
		this.provider.writeProperties(this.properties);

		for (const dimension of this.dimensions.values()) {
			dimension.save();
		}
	}

	/**
	 * Get a dimension from the world.
	 * If no name is provided, the default dimension will be returned.
	 *
	 * @param name The dimension name.
	 * @returns The dimension.
	 */
	public getDimension(name?: string): Dimension {
		return this.dimensions.get(name ?? this.properties.dimension)!;
	}

	public registerDimension(
		type: DimensionType,
		properties: DimensionProperties,
		generator: TerrainGenerator,
	): Dimension {
		if (this.dimensions.has(properties.identifier)) {
			this.logger.error(
				`Failed to register dimension, dimension identifier [${properties.identifier}] already exists!`,
			);

			return this.dimensions.get(properties.identifier)!;
		}

		this.dimensions.set(properties.identifier, new Dimension(this, type, properties, generator));

		return this.dimensions.get(properties.identifier)!;
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
		void this.network.broadcast(packet);
	}
}

export { World };
