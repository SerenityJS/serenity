import {
	type DataPacket,
	type DimensionType,
	TextPacket,
	TextPacketType,
	Vector3f
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { Player } from "../player";
import { Chunk } from "../chunk";
import { Block } from "../block";

import type { EntityIdentifier } from "@serenityjs/entity";
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
	public viewDistance: number = 128;

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
		world: World
	) {
		this.identifier = identifier;
		this.type = type;
		this.generator = generator;
		this.world = world;
		this.entities = new Map();
		this.blocks = new Map();
	}

	/**
	 * Ticks the dimension instance.
	 */
	public tick(): void {
		// TODO: Remove tick from the player
		// Tick all the players in the dimension
		for (const player of this.getPlayers()) player.tick();

		// Tick all the tickable block components
		for (const block of this.blocks.values()) {
			for (const component of block.components.values()) {
				// Tick the component
				component.onTick?.();
			}
		}

		// Tick all the tickable entity components
		for (const entity of this.entities.values()) {
			for (const component of entity.components.values()) {
				// Tick the component
				component.onTick?.();
			}
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
	 * Gets all the entities in the dimension.
	 */
	public getEntities(): Array<Entity> {
		return [...this.entities.values()].filter(
			(entity) => !(entity instanceof Player)
		) as Array<Player>;
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
	 *
	 * @param cx The chunk X coordinate.
	 * @param cz The chunk Z coordinate.
	 * @returns The chunk.
	 */
	public getChunk(cx: number, cz: number): Chunk {
		return this.world.provider.readChunk(cx, cz, this);
	}

	/**
	 * Gets a chunk from the dimension using a hash key.
	 *
	 * @param hash The hash of the chunk.
	 * @returns The chunk.
	 */
	public getChunkFromHash(hash: bigint): Chunk {
		// Calculate the chunk coordinates
		const coords = Chunk.fromHash(hash);

		// Get the chunk
		return this.getChunk(coords.x, coords.z);
	}

	/**
	 * Sets a chunk in the dimension.
	 *
	 * @param chunk The chunk to set.
	 */
	public setChunk(chunk: Chunk): void {
		this.world.provider.writeChunk(chunk, this);
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
	public getBlock(x: number, y: number, z: number): Block {
		// Check if the block is in the blocks
		if (this.blocks.has(Block.getHash({ x, y, z }))) {
			// Get the block from the blocks
			return this.blocks.get(Block.getHash({ x, y, z })) as Block;
		} else {
			// Get the chunk
			const chunk = this.getChunk(x >> 4, z >> 4);

			// Get the block permutation
			const permutation = chunk.getPermutation(x, y, z);

			// Convert the permutation to a block.
			const block = new Block(this, permutation, { x, y, z });

			// If the block has components add it to the blocks
			if (block.components.size > 0)
				this.blocks.set(Block.getHash({ x, y, z }), block);

			// Return the block
			return block;
		}
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
	public spawnEntity(identifier: EntityIdentifier, position: Vector3f): Entity {
		// Create a new Entity instance
		const entity = new Entity(identifier, this);

		// Set the entity position
		entity.position.x = position.x;
		entity.position.y = position.y;
		entity.position.z = position.z;

		// Spawn the entity
		entity.spawn();

		// Return the entity
		return entity;
	}
}

export { Dimension };
