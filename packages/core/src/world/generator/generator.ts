import { Worker } from "node:worker_threads";

import { ChunkCoords, DimensionType } from "@serenityjs/protocol";

import { Chunk } from "../chunk";
import { TerrainGeneratorProperties } from "../../types";
import { Dimension } from "../dimension";

import type { TerrainWorker } from "../worker/worker";

const DefaultTerrainGeneratorProperties: TerrainGeneratorProperties = {
  seed: Math.floor(Math.random() * 0x7fffffff)
};

interface WorkerData {
  cx: number;
  cz: number;
  type: DimensionType;
  buffer: Uint8Array;
  identifier: string;
  hash: bigint;
}

class TerrainGenerator {
  /**
   * The identifier of the generator.
   */
  public static readonly identifier: string;

  /**
   * The terrain worker for the generator, if applicable.
   */
  public static worker: typeof TerrainWorker | null = null;

  /**
   * The identifier of the generator.
   */
  public readonly identifier = (this.constructor as typeof TerrainGenerator)
    .identifier;

  /**
   * The dimension of the generator.
   */
  public readonly dimension: Dimension;

  /**
   * The properties of the generator.
   */
  public readonly properties: TerrainGeneratorProperties =
    DefaultTerrainGeneratorProperties;

  /**
   * The worker thread for the generator, if applicable.
   */
  public readonly worker: Worker | null = null;

  /**
   * The chunk queue for the generator.
   */
  public readonly queue = new Map<bigint, (value: Chunk) => void>();

  /**
   * Creates a new terrain generator with the specified properties.
   * @param properties The properties to use for the generator.
   */
  public constructor(
    dimension: Dimension,
    properties?: Partial<TerrainGeneratorProperties>
  ) {
    // Set the dimension & world of the generator.
    this.dimension = dimension;

    // Set the properties of the generator.
    this.properties = { ...DefaultTerrainGeneratorProperties, ...properties };

    // Get the generator prototype.
    const prototype = this.constructor as typeof TerrainGenerator;

    // Assign the identifier of the generator.
    this.identifier = prototype.identifier;

    // Check if a worker is defined for the generator.
    if (prototype.worker) {
      // Initialize the worker with the properties of the generator.
      this.worker = prototype.worker.initialize(this.properties);

      // Listen for messages from the worker.
      this.worker.on("message", (data: WorkerData) => {
        // Check if the identifier matches the generator's identifier.
        if (data.identifier !== this.identifier) return;

        // Check if the queue has the chunk hash.
        if (!this.queue.has(data.hash)) return;

        // Get the resolve function from the queue.
        const resolve = this.queue.get(data.hash)!;

        // Convert the Uint8Array to a Buffer.
        const buffer = Buffer.from(data.buffer);

        // Deserialize the chunk from the buffer.
        const chunk = Chunk.deserialize(data.type, data.cx, data.cz, buffer);

        // Resolve the promise with the chunk.
        resolve(chunk);

        // Remove the chunk from the queue.
        this.queue.delete(data.hash);
      });
    }
  }

  /**
   * Generates a chunk at the specified coordinates.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   */
  public async apply(_cx: number, _cz: number): Promise<Chunk> {
    throw new Error(`${this.identifier}.apply() is not implemented`);
  }

  /**
   * Hands off the chunk generation to the worker thread.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   * @returns A promise that resolves with the generated chunk.
   */
  protected async handoff(cx: number, cz: number): Promise<Chunk> {
    // Check if the worker is available.
    if (!this.worker) {
      throw new Error(
        `${this.identifier} does not have a worker to hand off the chunk.`
      );
    }

    // Create and return a promise that resolves when the worker is done.
    return new Promise((resolve) => {
      // Generate the hash for the chunk.
      const hash = ChunkCoords.hash({ x: cx, z: cz });

      // Check if the chunk is already in the queue.
      if (this.queue.has(hash)) {
        // Create an unready empty chunk to return.
        const chunk = new Chunk(cx, cz, this.dimension.type);

        // Immediately resolve with the unready chunk.
        return resolve(chunk);
      }

      // Add the chunk to the queue with a unique identifier.
      this.queue.set(hash, resolve);

      // Create a data object to send to the worker.
      const data = {
        cx,
        cz,
        type: this.dimension.type,
        identifier: this.identifier
      };

      // Pass the buffer to the worker thread.
      this.worker?.postMessage(data);
    });
  }

  /**
   * Called after a chunk is generated to populate it with features.
   * @param chunk The chunk that was recently generated.
   */
  public async populate?(_chunk: Chunk): Promise<void>;
}

export { TerrainGenerator };
