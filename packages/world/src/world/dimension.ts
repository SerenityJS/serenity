import {
	BlockPosition,
	ChunkCoords,
	type DataPacket,
	type DimensionType,
	type IPosition,
	PlaySoundPacket,
	TextPacket,
	TextPacketType,
	Vector3f
} from "@serenityjs/protocol";
import {
	CommandExecutionState,
	type CommandResponse
} from "@serenityjs/command";
import { EntityIdentifier } from "@serenityjs/entity";

import { Entity } from "../entity";
import { Player } from "../player";
import { Block } from "../block";
import {
	BlockStateComponent,
	type EntityComponent,
	EntityHasGravityComponent,
	EntityItemComponent,
	EntityPhysicsComponent
} from "../components";
import { ChunkReadSignal } from "../events";
import { ItemStack } from "../item";

import { TickSchedule } from "./schedule";

import type { DimensionSoundOptions } from "../options";
import type { DimensionBounds } from "../types";
import type { Chunk } from "../chunk";
import type { Items } from "@serenityjs/item";
import type { TerrainGenerator } from "../generator";
import type { World } from "./world";

class Dimension {
	/**
	 * The identifier of the dimension.
	 */
	public readonly identifier: string;

	/**
	 * The type of the dimension.
	 */
	public readonly type: DimensionType;

	/**
	 * The generator of the dimension.
	 */
	public readonly generator: TerrainGenerator;

	/**
	 * The world the dimension belongs to.
	 */
	public readonly world: World;

	/**
	 * The entities in the dimension.
	 */
	public readonly entities: Map<bigint, Entity>;

	/**
	 * The blocks that contain components in the dimension.
	 */
	public readonly blocks: Map<bigint, Block>;

	/**
	 * The spawn position of the dimension.
	 */
	public spawn = new Vector3f(0, 0, 0);

	/**
	 * The view distance of the dimension.
	 */
	public viewDistance: number = 16;

	/**
	 * The simulation distance of the dimension.
	 */
	public simulationDistance: number = 8;

	/**
	 * The min-max dimension build limits
	 */
	public bounds: DimensionBounds;

	/**
	 * Creates a new dimension.
	 *
	 * @param identifier The identifier of the dimension.
	 * @param type The type of the dimension.
	 * @param generator The generator of the dimension.
	 * @param world The world the dimension belongs to.
	 * @returns A new dimension.
	 */
	public constructor(
		identifier: string,
		type: DimensionType,
		generator: TerrainGenerator,
		world: World,
		bounds?: DimensionBounds
	) {
		this.identifier = identifier;
		this.type = type;
		// ? Default Bounds
		this.bounds = bounds ?? { min: -64, max: 320 };
		this.generator = generator;
		this.world = world;
		this.entities = new Map();
		this.blocks = new Map();
	}

	/**
	 * Ticks the dimension instance.
	 */
	public tick(deltaTick: number): void {
		// Return if there are no players in the dimension
		if (this.getPlayers().length === 0) return;

		// Get the positions of all the players in the dimension
		const positions = this.getPlayers().map((player) => player.position);

		// Iterate over all the entities in the dimension
		for (const entity of this.entities.values()) {
			// Check if there is a player within the simulation distance to tick the entity
			const inSimulationRange = positions.some((position) => {
				const distance = position.distance(entity.position);
				return distance <= this.simulationDistance << 4;
			});

			// Tick the entity if it is in simulation range
			if (inSimulationRange) {
				// Iterate over all the components in the entity
				for (const component of entity.components.values())
					try {
						component.onTick?.(deltaTick);
					} catch (reason) {
						// Log the error to the console
						this.world.logger.error(
							`Failed to tick entity component "${component.identifier}" for entity "${entity.type.identifier}:${entity.unique}" in dimension "${this.identifier}"`,
							reason
						);

						// Remove the component from the entity
						entity.components.delete(component.identifier);
					}
			}
		}

		// Iterate over all the blocks in the dimension
		for (const block of this.blocks.values()) {
			// Get the block position
			const position = new Vector3f(
				block.position.x,
				block.position.y,
				block.position.z
			);

			// Check if there is a player within the simulation distance to tick the block
			const inSimulationRange = positions.some((player) => {
				const distance = player.distance(position);
				return distance <= this.simulationDistance;
			});

			// Tick the block if it is in simulation range
			if (inSimulationRange) {
				// Iterate over all the components in the block
				// Try to tick the block component
				for (const component of block.getComponents())
					try {
						component.onTick?.(deltaTick);
					} catch (reason) {
						// Log the error to the console
						this.world.logger.error(
							`Failed to tick block component "${component.identifier}" for block "${block.position.x}, ${block.position.y}, ${block.position.z}" in dimension "${this.identifier}"`,
							reason
						);

						// Remove the component from the block
						block.components.delete(component.identifier);
					}
			}
		}
	}

	/**
	 * Schedules a tick to be executed after a certain amount of ticks.
	 * @param ticks The amount of ticks to wait before the schedule is complete.
	 * @returns The tick schedule that was created.
	 */
	public schedule(ticks: number): TickSchedule {
		// Create a new tick schedule
		const schedule = new TickSchedule(ticks, this);

		// Add the schedule to the world
		this.world.schedules.add(schedule);

		// Return the schedule
		return schedule;
	}

	/**
	 * Executes a command in the dimension.
	 * @param command The command to execute.
	 * @returns The response of the command.
	 */
	public executeCommand<T = unknown>(
		command: string
	): CommandResponse<T> | null {
		// Check if the command starts with a slash, remove it if it does not
		if (command.startsWith("/")) command = command.slice(1);

		// Create a new command execute state
		const state = new CommandExecutionState(
			this.world.commands.getAll(),
			command,
			this
		);

		try {
			// Execute the command state
			return state.execute() as CommandResponse<T>;
		} catch (reason) {
			// Log the error to the console
			this.world.logger.error(
				`Failed to execute command "${command}" in dimension "${this.identifier}"`,
				reason
			);

			// Return null if the command was not executed successfully
			return null;
		}
	}

	/**
	 * Gets all the players in the dimension.
	 */
	public getPlayers(): Array<Player> {
		return [...this.entities.values()].filter(
			(entity) => entity instanceof Player
		) as Array<Player>;
	}

	/**
	 * Gets an entity from the dimension.
	 * @param uniqueId The unique identifier of the entity.
	 * @returns The entity that was found.
	 */
	public getEntity(uniqueId: bigint): Entity | undefined {
		return this.entities.get(uniqueId);
	}

	/**
	 * Gets an entity from the dimension using the runtime identifier.
	 * @param runtime The runtime identifier of the entity.
	 * @returns The entity that was found.
	 */
	public getEntityByRuntime(runtime: bigint): Entity | undefined {
		for (const entity of this.entities.values())
			if (entity.runtime === runtime) return entity;
	}

	/**
	 * Gets all the entities in the dimension.
	 * @param players Whether or not to include players.
	 */
	public getEntities(players = true): Array<Entity> {
		return [...this.entities.values()].filter((entity) => {
			// Check if the entity is a player
			if (!players && entity.isPlayer()) return false;

			// Return the entity
			return true;
		});
	}

	/**
	 * Gets all the entities in a chunk.
	 * @param chunk The chunk to query.
	 * @param players Whether or not to include players.
	 * @returns All the entities in the chunk.
	 */
	public getEntitiesInChunk(chunk: Chunk, players = true): Array<Entity> {
		return this.getEntities().filter((entity) => {
			// Check if the entity is a player
			if (!players && entity.isPlayer()) return false;

			// Get the entities chunk
			const entChunk = entity.getChunk();

			// Check if entities chunk and the given chunk are the same
			return entChunk.x === chunk.x && entChunk.z === chunk.z;
		});
	}

	/**
	 * Broadcasts packets to all the players in the dimension.
	 *
	 * @param packets The packets to broadcast.
	 */
	public broadcast(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers()) player.session.send(...packets);
	}

	/**
	 * Broadcasts packets to all the players in the dimension immediately.
	 *
	 * @param packets The packets to broadcast.
	 */
	public broadcastImmediate(...packets: Array<DataPacket>): void {
		for (const player of this.getPlayers())
			player.session.sendImmediate(...packets);
	}

	/**
	 * Broadcasts packets to all the players in the dimension except one.
	 *
	 * @param player The player to exclude.
	 * @param packets The packets to broadcast.
	 */
	public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
		for (const x of this.getPlayers())
			if (x !== player) x.session.send(...packets);
	}

	/**
	 * Gets a chunk from the dimension.
	 * @param cx The chunk X coordinate.
	 * @param cz The chunk Z coordinate.
	 * @returns The chunk.
	 */
	public getChunk(cx: number, cz: number): Chunk {
		// Read the chunk from the provider
		const chunk = this.world.provider.readChunk(cx, cz, this);

		// Create a new ChunkReadSignal
		const signal = new ChunkReadSignal(chunk, this);
		const value = signal.emit();

		// Check if the signal was attempted to be cancelled
		if (value === false)
			// Log a warning to the console, as this signal cannot be cancelled
			this.world.logger.warn(
				`Chunk read signal cannot be cancelled, chunk: ${cx}, ${cz}`
			);

		// Return the chunk
		return chunk;
	}

	/**
	 * Gets a chunk from the dimension using a hash key.
	 * @param hash The hash of the chunk.
	 * @returns The chunk.
	 */
	public getChunkFromHash(hash: bigint): Chunk {
		// Calculate the chunk coordinates
		const coords = ChunkCoords.unhash(hash);

		// Get the chunk
		return this.getChunk(coords.x, coords.z);
	}

	/**
	 * Sets a chunk in the dimension.
	 * @param chunk The chunk to set.
	 */
	public setChunk(chunk: Chunk): void {
		// Create a new ChunkWriteSignal
		const signal = new ChunkReadSignal(chunk, this);
		const value = signal.emit();

		// Check if the signal was attempted to be cancelled
		if (value === false)
			// Log a warning to the console, as this signal cannot be cancelled
			this.world.logger.warn(
				`Chunk write signal cannot be cancelled, chunk: ${chunk.x}, ${chunk.z}`
			);

		// Write the chunk to the provider
		return this.world.provider.writeChunk(chunk, this);
	}

	/**
	 * Gets the spawn chunks of the dimension.
	 *
	 * @returns The spawn chunks.
	 */
	public getSpawnChunks(): Array<Chunk> {
		// Prepare the chunks
		const chunks: Array<Chunk> = [];

		// Calculate the view distance
		const distance = this.viewDistance >> 4;

		// Calculate the chunk coordinates
		const minX = Math.floor(this.spawn.x - distance);
		const minZ = Math.floor(this.spawn.z - distance);
		const maxX = Math.floor(this.spawn.x + distance);
		const maxZ = Math.floor(this.spawn.z + distance);

		// Iterate over the chunks
		for (let x = minX; x <= maxX; x++) {
			for (let z = minZ; z <= maxZ; z++) {
				chunks.push(this.getChunk(x, z));
			}
		}

		// Return the chunks
		return chunks;
	}

	/**
	 * Gets a block from the dimension.
	 *
	 * @param x The X coordinate of the block.
	 * @param y The Y coordinate of the block.
	 * @param z The Z coordinate of the block.
	 * @returns The block.
	 */
	public getBlock(position: IPosition): Block {
		// Get X and Z coordinates to get the chunk of the position.
		const { x, z } = position;
		const hash = BlockPosition.hash(position as BlockPosition);

		// Get the block from the block cache.
		const block = this.blocks.get(hash);

		// If the block is in the block cache, return it.
		if (block) return block;
		else {
			// Get the chunk position
			const chunk = this.getChunk(x >> 4, z >> 4);

			// Get the block permutation at the block's position
			const permutation = chunk.getPermutation(position);

			// Convert the permutation to a block.
			const block = new Block(
				this,
				permutation,
				new BlockPosition(position.x, position.y, position.z)
			);

			// Get the components of the block.
			const components = this.world.blocks.getRegistry(
				permutation.type.identifier
			);

			// Register the components that are type specific.
			for (const identifier of permutation.type.components) {
				// Get the component from the registry
				const component = this.world.blocks.getComponent(identifier);

				// Check if the component exists.
				if (component) components.push(component);
			}

			// Register the components that are state specific.
			for (const key of Object.keys(permutation.state)) {
				// Iterate over the components in the registry.
				for (const component of this.world.blocks.getAllComponents()) {
					// Check if the component is a BlockStateComponent.
					if (component.prototype instanceof BlockStateComponent) {
						// Get the component as a BlockStateComponent.
						const componentx = component as typeof BlockStateComponent;

						// Check if the component has the same state.
						if (componentx.state === key) {
							components.push(component);
						}
					}
				}
			}

			// Attempt to register the components.
			for (const component of components) {
				// Check if the component is already registered.
				if (block.components.has(component.identifier)) continue;

				// Try to create a new component.
				try {
					// Create a new component.
					const instance = new component(block, component.identifier);

					// Register the component.
					block.components.set(component.identifier, instance);
				} catch (reason) {
					// Get the position of the block.
					const { x, y, z } = block.position;

					// Log the error to the console.
					this.world.logger.error(
						`Failed to create component "${component.identifier}" for block "${permutation.type.identifier}" at ${x}, ${y}, ${z}.`,
						reason
					);
				}
			}

			// If the block has components add it to the blocks
			if (components.length > 0) this.blocks.set(hash, block);

			// Return the block
			return block;
		}
	}

	/**
	 * Gets the topmost block in which the permutation is not air, at the given X and Z coordinates.
	 * @param position The position to query.
	 * @returns The topmost block in which the permutation is not air.
	 */
	public getTopmostBlock(position: IPosition): Block {
		// Get the current chunk
		const chunk = this.getChunk(position.x >> 4, position.z >> 4);

		// Get the topmost level that is not air
		const topLevel = chunk.getTopmostLevel(position);

		// Return the block
		return this.getBlock({ ...position, y: topLevel });
	}

	/**
	 * Gets the bottommost block in which the permutation is not air, at the given X and Z coordinates.
	 * @param position The position to query.
	 * @returns The bottommost block in which the permutation is not air.
	 */
	public getBottommostBlock(position: IPosition): Block {
		// Get the current chunk
		const chunk = this.getChunk(position.x >> 4, position.z >> 4);

		// Get the bottommost level that is not air
		const bottomLevel = chunk.getBottommostLevel(position);

		// Return the block
		return this.getBlock({ ...position, y: bottomLevel });
	}

	/**
	 * Sends a message to all the players in the dimension.
	 * @param message The message to send.
	 */
	public sendMessage(message: string): void {
		// Create a new TextPacket
		const packet = new TextPacket();

		// Set the packet properties
		packet.type = TextPacketType.Raw;
		packet.needsTranslation = false;
		packet.source = null;
		packet.message = message;
		packet.parameters = null;
		packet.xuid = "";
		packet.platformChatId = "";
		packet.filtered = message;

		// Broadcast the packet
		this.broadcast(packet);
	}

	/**
	 * Spawns an entity in the dimension.
	 *
	 * @param identifier The identifier of the entity.
	 * @param position The position of the entity.
	 * @returns The entity that was spawned.
	 */
	public spawnEntity(
		identifier: EntityIdentifier | Entity,
		position: Vector3f
	): Entity {
		// Create a new Entity instance
		const entity =
			identifier instanceof Entity ? identifier : new Entity(identifier, this);

		// Apply physics to the entity
		new EntityPhysicsComponent(entity);
		new EntityHasGravityComponent(entity);

		// Register all valid components to the entity
		for (const identifier of entity.type.components) {
			// Get the component from the entity component registry
			const component = this.world.entities.getComponent(
				identifier
			) as typeof EntityComponent;

			// Check if the component is valid
			if (!component) continue;

			// Check if the component is valid
			if (component) {
				// Create a new instance of the component
				new component(entity, identifier);
			}
		}

		// Set the entity position
		entity.position.x = position.x;
		entity.position.y = position.y;
		entity.position.z = position.z;

		// Spawn the entity if the signal was not cancelled
		entity.spawn();

		// Return the entity
		return entity;
	}

	/**
	 * Spawns an item in the dimension.
	 *
	 * @param itemStack The item stack of the item.
	 * @param position The position of the item.
	 * @returns The entity that was spawned.
	 */
	public spawnItem<T extends keyof Items>(
		itemStack: ItemStack<T>,
		position: Vector3f
	): Entity {
		// Create a new Entity instance
		const entity = new Entity(EntityIdentifier.Item, this);

		// Set the entity position
		entity.position.x = position.x;
		entity.position.y = position.y;
		entity.position.z = position.z;

		// Create a new item component, this will register the item to the entity
		// As well as a new physics component
		const component = new EntityItemComponent(entity);
		component.itemStack = itemStack;

		new EntityPhysicsComponent(entity);
		new EntityHasGravityComponent(entity);

		// Spawn the item entity
		entity.spawn();

		// Return the item entity
		return entity;
	}

	/**
	 * Create an item stack in the dimension.
	 * @param identifier The identifier of the item.
	 * @param amount The amount of the item.
	 * @param metadata The metadata of the item.
	 * @returns The item stack that was created.
	 */
	public createItemStack<T extends keyof Items>(
		identifier: T,
		amount: number,
		metadata: number
	): ItemStack<T> {
		return new ItemStack(identifier, amount, metadata, this);
	}

	/**
	 * Plays a sound in the dimension.
	 * @param sound The sound to play.
	 * @param position The position to play the sound at.
	 * @param options The options of the sound.
	 */
	public playSound(
		sound: string,
		position: BlockPosition,
		options?: DimensionSoundOptions
	): void {
		// Create a new PlaySoundPacket
		const packet = new PlaySoundPacket();

		// Mojank...
		position.x *= 8;
		position.y *= 8;
		position.z *= 8;

		// Set the packet properties
		packet.name = sound;
		packet.position = position;
		packet.volume = options?.volume ?? 1;
		packet.pitch = options?.pitch ?? 1;

		// Broadcast the packet
		this.broadcast(packet);
	}
}

export { Dimension };
