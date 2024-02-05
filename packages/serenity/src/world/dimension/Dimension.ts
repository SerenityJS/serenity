import {
	UpdateBlock,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	type DataPacket,
	type Vec3f,
} from '@serenityjs/bedrock-protocol';
import type { Player } from '../../player';
import type { World } from '../World';
import { Block, BlockPermutation, Chunk } from '../chunk';
import type { TerrainGenerator } from '../generator';

class Dimension {
	protected readonly world: World;

	public generator: TerrainGenerator;
	public spawnPosition: Vec3f = { x: 0, y: 0, z: 0 };
	public viewDistance: number = 64;

	public readonly identifier: number;
	public readonly name: string;
	public readonly chunks: Map<bigint, Chunk>;

	public constructor(
		world: World,
		generator: TerrainGenerator,
		identifier: number,
		name: string,
		chunks?: Map<bigint, Chunk>,
	) {
		this.world = world;
		this.generator = generator;
		this.identifier = identifier;
		this.name = name;
		this.chunks = chunks ?? new Map();
	}

	public getPlayers(): Player[] {
		return Array.from(this.world.players.values()).filter((player) => player.getDimension() === this);
	}

	public broadcast(...packets: DataPacket[]): void {
		for (const player of this.getPlayers()) void player.session.send(...packets);
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param x Chunk x.
	 * @param y Chunk z.
	 * @returns Already generated or new chunk.
	 */
	public getChunk(x: number, y: number): Chunk {
		// Calulate the hash value
		const hash = Chunk.getHash(x, y);

		// Check if the chunk is already generated
		const chunk =
			this.chunks.get(hash) ?? this.generator.apply(new Chunk(x, y, BlockPermutation.resolve('minecraft:air')!));

		// Set the chunk
		this.chunks.set(hash, chunk);

		// Return the chunk
		return chunk;
	}

	/**
	 * Get a chunk from the dimension.
	 *
	 * @param hash The chunk hash.
	 * @returns Already generated or new chunk.
	 */
	public getChunkFromHash(hash: bigint): Chunk {
		// Calulate the x and z values
		const vec2f = Chunk.fromHash(hash);

		// Return the chunk
		return this.getChunk(vec2f.x, vec2f.z);
	}

	public getSpawnChunks(): Chunk[] {
		// Prepare an array to store the chunks
		const chunks = [];

		// Calculate the view distance in chunks
		const distance = this.viewDistance >> 4;

		const minX = this.spawnPosition.x - distance;
		const minZ = this.spawnPosition.z - distance;
		const maxX = this.spawnPosition.x + distance;
		const maxZ = this.spawnPosition.z + distance;

		for (let cx = minX; cx <= maxX; ++cx) {
			for (let cz = minZ; cz <= maxZ; ++cz) {
				chunks.push(this.getChunk(cx, cz));
			}
		}

		// Return the chunks
		return chunks;
	}

	public getChunksToRender(x: number, z: number): Chunk[] {
		// Prepare an array to store the chunks
		const chunks = [];

		// Calculate the view distance in chunks
		const distance = this.viewDistance >> 4;

		const minX = x - distance;
		const minZ = z - distance;
		const maxX = x + distance;
		const maxZ = z + distance;

		for (let cx = minX; cx <= maxX; ++cx) {
			for (let cz = minZ; cz <= maxZ; ++cz) {
				chunks.push(this.getChunk(cx, cz));
			}
		}

		// Return the chunks
		return chunks;
	}

	public getBlock(x: number, y: number, z: number): Block {
		// Get the chunk
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Get the block permutation
		const permutation = chunk.getPermutation(x, y, z);

		// Convert the permutation to a block and return it
		return new Block(this, permutation, { x, y, z });
	}

	public setPermutation(x: number, y: number, z: number, permutation: BlockPermutation): void {
		// Get the chunk
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Set the permutation
		chunk.setPermutation(x, y, z, permutation);

		for (const player of this.getPlayers()) {
			const update = new UpdateBlock();
			update.blockRuntimeId = permutation.getRuntimeId();
			update.position = { x, y, z };
			update.flags = UpdateBlockFlagsType.Network;
			update.layer = UpdateBlockLayerType.Normal;

			void player.session.send(update);
		}
	}
}

export { Dimension };
