import { ChunkCoords, DimensionType } from "@serenityjs/protocol";

import { type Dimension, World } from "../world";
import { Superflat } from "../generator";

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
	public readonly chunks: Map<string, Map<bigint, Chunk>> = new Map();

	public static initialize(config: WorldConfig): World {
		// Create the world.
		const world = new World(config.identifier, new this());

		// TODO: Register custom dimensions.

		// Create the overworld dimension.
		world.createDimension(
			"overworld",
			DimensionType.Overworld,
			new Superflat()
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
		if (!this.chunks.has(dimension.identifier)) {
			this.chunks.set(dimension.identifier, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(dimension.identifier) as Map<bigint, Chunk>;

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
		if (!this.chunks.has(dimension.identifier)) {
			this.chunks.set(dimension.identifier, new Map());
		}

		// Get the dimension chunks.
		const chunks = this.chunks.get(dimension.identifier) as Map<bigint, Chunk>;

		// Set the chunk.
		chunks.set(ChunkCoords.hash({ x: chunk.x, z: chunk.z }), chunk);
	}

	public writePlayer(_player: Player): void {
		return;
	}
}

export { InternalProvider };
