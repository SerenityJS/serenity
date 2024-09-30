import { ChunkCoords, DimensionType } from "@serenityjs/protocol";

import { type Dimension, World } from "../world";
import { Overworld } from "../generator";

import { WorldProvider } from "./provider";

import type { Player } from "../player";
import type { WorldConfig } from "../types";
import type { Chunk } from "../chunk";

/**
 * The internal provider is a basic provider that stores chunks in memory.
 * This provider does not save or load chunks from disk, it is used for testing and development.
 */
class InternalProvider extends WorldProvider {
	public static readonly identifier = "internal";

	/**
	 * The chunks stored in the provider.
	 */
	public readonly chunks: Map<Dimension, Map<bigint, Chunk>> = new Map();
	/**
	 * The number of rented chunks by players in the provider.
	 */
	public readonly borrowers: WeakMap<Chunk, Set<object>> = new WeakMap();

	public readChunkCache(
		cx: number,
		cz: number,
		dimension: Dimension
	): Chunk | null {
		// Get the dimension index from the dimensions array.
		// This will be used as the dimension key in the database.
		const index = this.dimensionIndexOf(dimension);

		// Check if the dimension index was found.
		if (index === -1)
			throw new Error(
				`Dimension index "${dimension}" was not found for world.`
			);

		// Check if the chunks map has the index.
		if (!this.chunks.has(dimension))
			this.chunks.set(dimension, new Map<bigint, Chunk>());

		// Get the chunks map for the dimension index.
		const chunks = this.chunks.get(dimension);

		// Check if no chunks were found.
		if (!chunks)
			throw new Error(
				`Failed to get chunks for dimension "${dimension}" with index "${index}"`
			);

		// Hash the chunk coordinates.
		const hash = ChunkCoords.hash({ x: cx, z: cz });

		// Check if the chunk exists in the chunks map.
		if (chunks.has(hash)) {
			// Return the chunk from the chunks cache.
			return chunks.get(hash) as Chunk;
		}
		return null;
	}

	public rentChunk<T extends object>(
		borrower: T,
		cx: number,
		cz: number,
		dimension: Dimension
	): Chunk {
		const chunk = this.readChunk(cx, cz, dimension);
		const sets = this.borrowers.get(chunk) ?? new Set();
		sets.add(borrower);
		this.borrowers.set(chunk, sets);
		return chunk;
	}

	public returnChunk<T extends object>(
		borrower: T,
		cx: number,
		cz: number,
		dimension: Dimension
	): boolean {
		const chunk = this.readChunkCache(cx, cz, dimension);
		if (chunk) {
			const sets = this.borrowers.get(chunk);
			if (!sets) return false;

			sets.delete(borrower);

			// Get the dimension index from the dimensions array.
			// This will be used as the dimension key in the database.
			const index = this.dimensionIndexOf(dimension);

			// Check if the dimension index was found.
			if (index === -1)
				throw new Error(
					`Dimension index "${dimension}" was not found for world.`
				);

			// Check if the chunks map has the index.
			if (!this.chunks.has(dimension)) return true; //Return true bc we know this chunk was borrowed

			// Get the chunks map for the dimension index.
			const chunks = this.chunks.get(dimension);

			// Check if no chunks were found.
			if (!chunks) return true; //Return true bc we know this chunk was borrowed

			// Hash the chunk coordinates.
			const hash = ChunkCoords.hash({ x: cx, z: cz });

			// delete chunk from cache
			chunks.delete(hash);
			return true;
		}
		return false;
	}

	public static initialize(config: WorldConfig): World {
		// Create the world.
		const world = new World(config.identifier, new this());

		// TODO: Register custom dimensions.

		// Create the overworld dimension.
		world.createDimension(
			"overworld",
			DimensionType.Overworld,
			new Overworld(world.blocks, config.seed)
		);

		// Return the world.
		return world;
	}

	public save(): void {
		for (const [_, dimension] of this.chunks) {
			for (const [_, chunk] of dimension) {
				chunk.dirty = false;
			}
		}
	}

	public readChunk(cx: number, cz: number, dimension: Dimension): Chunk {
		// Check if the chunks contain the dimension.
		if (!this.chunks.has(dimension)) {
			this.chunks.set(dimension, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(dimension) as Map<bigint, Chunk>;

		// Check if the chunks contain the chunk hash.
		if (!chunks.has(ChunkCoords.hash({ x: cx, z: cz }))) {
			chunks.set(
				ChunkCoords.hash({ x: cx, z: cz }),
				dimension.generator.apply(cx, cz, dimension.type)
			);
		}

		// Return the chunk.
		return chunks.get(ChunkCoords.hash({ x: cx, z: cz })) as Chunk;
	}

	public writeChunk(chunk: Chunk, dimension: Dimension): void {
		// Check if the chunks contain the dimension.
		if (!this.chunks.has(dimension)) {
			this.chunks.set(dimension, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(dimension) as Map<bigint, Chunk>;

		// Set the chunk.
		chunks.set(ChunkCoords.hash({ x: chunk.x, z: chunk.z }), chunk);
	}

	public writePlayer(_player: Player): void {
		return;
	}
}

export { InternalProvider };
