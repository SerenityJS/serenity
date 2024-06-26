import { isMainThread, type Worker } from "node:worker_threads";

import type { TerrainGenerator } from "../generator";
import type { DimensionType } from "@serenityjs/protocol";
import type { Chunk } from "../../chunk";

class TerrainWorker {
	/**
	 * The path of the worker file.
	 */
	public static readonly path = __filename;

	/**
	 * The seed of the generator.
	 */
	public readonly seed: number;

	/**
	 * The generator for the worker.
	 */
	public readonly generator: typeof TerrainGenerator;

	/**
	 * Creates a new worker instance.
	 */
	public constructor(seed: number, generator: typeof TerrainGenerator) {
		// Check if we are in the main thread
		if (isMainThread)
			throw new Error("Worker can only be initialized in a worker thread");

		this.seed = seed;
		this.generator = generator;
	}

	/**
	 * Generates a chunk at the specified coordinates.
	 * @param _cx The chunk x coordinate.
	 * @param _cz  The chunk z coordinate.
	 * @param _type The dimension type.
	 */
	public apply(_cx: number, _cz: number, _type: DimensionType): Chunk {
		throw new Error("TerrainWorker.apply is not implemented");
	}

	/**
	 * Initializes the worker thread.
	 */
	public static initialize(_seed: number): Worker {
		throw new Error("TerrainWorker.initialize is not implemented");
	}
}

export { TerrainWorker };
