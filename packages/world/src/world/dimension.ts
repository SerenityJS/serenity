import { DataPacket, DimensionType, Vector3f } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { Player } from "../player";
import { TerrainGenerator } from "../generator";
import { Chunk } from "../chunk";

import { World } from "./world";

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

	public spawn = new Vector3f(0, 0, 0);
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
	}

	/**
	 * Ticks the dimension instance.
	 */
	public tick(): void {
		// Tick all the entities in the dimension (e.g. players, mobs, etc.)
		for (const entity of this.entities.values()) entity.tick();
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
			(entity) => entity! instanceof Player
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
}

export { Dimension };
