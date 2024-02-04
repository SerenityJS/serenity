import type { Vec3f } from '@serenityjs/bedrock-protocol';
import type { World } from '../World';
import { BlockPermutation, Chunk } from '../chunk';
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

	// TODO: wrap the permutation in a Block class
	public getBlock(x: number, y: number, z: number): BlockPermutation {
		// Get the chunk
		const chunk = this.getChunk(x >> 4, z >> 4);

		// Get the block
		return chunk.getBlock(x, y, z);
	}
}

export { Dimension };
