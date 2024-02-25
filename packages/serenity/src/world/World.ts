import {
	AbilityLayerType,
	ChatTypes,
	Gamemode,
	Text,
	UpdateAbilities,
	UpdateAttributes,
} from '@serenityjs/bedrock-protocol';
import type { DimensionType } from '@serenityjs/bedrock-protocol';
import { Logger } from '../console/index.js';
import type { Player } from '../player/index.js';
import type { WorldProvider } from '../provider/index.js';
import type { WorldProperties } from '../types/index.js';
import { WorldNetwork } from './Network.js';
import { DEFAULT_WORLD_PROPERTIES } from './Properties.js';
import { BlockMapper } from './chunk/index.js';
import { Dimension } from './dimension/index.js';
import type { TerrainGenerator } from './generator/index.js';
import { ItemMapper } from './items/Mapper.js';

class World {
	public readonly name: string;

	/**
	 * This is the provider for the world, it handles reading and writing the world data.
	 */
	public readonly provider: WorldProvider;

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

	public readonly items: ItemMapper;

	/**
	 * The dimensions in the world mapped by their identifier.
	 */
	public readonly dimensions: Map<string, Dimension>;

	public gamemode: Gamemode = Gamemode.Survival;

	public constructor(name: string, provider: WorldProvider, properties?: WorldProperties) {
		this.name = name;
		this.provider = provider;
		this.properties = properties ?? DEFAULT_WORLD_PROPERTIES;
		this.network = new WorldNetwork(this);
		this.logger = new Logger(this.properties.name, '#34eb92');
		this.blocks = new BlockMapper(this);
		this.items = new ItemMapper(this);
		this.dimensions = new Map();
	}

	/**
	 * Get the players in the world.
	 *
	 * @returns The players in the world.
	 */
	public getPlayers(): Player[] {
		const players = [...this.dimensions.values()].map((dimension) => dimension.getPlayers());

		return players.flat();
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

	public registerDimension(identifier: string, type: DimensionType, generator: TerrainGenerator): Dimension {
		// Check if the dimension is already registered.
		if (this.dimensions.has(identifier)) {
			this.logger.error(`Failed to register dimension, dimension identifier [${identifier}] already exists!`);

			return this.dimensions.get(identifier)!;
		}

		// Construct the dimension.
		const dimension = new Dimension(identifier, type, generator, this);

		// Add the dimension to the map.

		this.dimensions.set(identifier, dimension);

		// Return the dimension.
		return dimension;
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
		this.network.broadcast(packet);
	}

	public updateAbilities(player: Player): void {
		// Construct the packet.
		const packet = new UpdateAbilities();

		// Assign the packet data.
		packet.entityUniqueId = player.uniqueId;
		packet.permissionLevel = 2; // TODO
		packet.commandPersmissionLevel = 2; // TODO
		packet.abilities = [
			{
				type: AbilityLayerType.Base,
				flags: [...player.abilities.entries()].map(([flag, value]) => ({ flag, value })),
				flySpeed: 0.05,
				walkSpeed: 0.1,
			},
		];

		// Broadcast the packet.
		this.network.broadcast(packet);
	}

	public updateAttributes(player: Player): void {
		// Construct the packet.
		const packet = new UpdateAttributes();

		// Assign the packet data.
		packet.runtimeEntityId = player.runtimeId;
		packet.attributes = player.getAttributes().map((component) => {
			return {
				name: component.type,
				min: component.effectiveMin,
				max: component.effectiveMax,
				current: component.currentValue,
				default: component.defaultValue,
				modifiers: [],
			};
		});
		packet.tick = 0n; // TODO: implement ticking

		// Broadcast the packet.
		this.network.broadcast(packet);
	}
}

export { World };
