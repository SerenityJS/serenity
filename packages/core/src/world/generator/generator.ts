import { Chunk } from "../chunk";
import { TerrainGeneratorProperties } from "../../types";
import { Dimension } from "../dimension";
import { World } from "../world";
import { ChunkReadySignal } from "../../events";

import type { TerrainWorker } from "./worker";
import type { Worker } from "node:worker_threads";

const DefaultTerrainGeneratorProperties: TerrainGeneratorProperties = {
  seed: Math.floor(Math.random() * 0x7fffffff)
};

class TerrainGenerator {
  /**
   * The identifier of the generator.
   */
  public static readonly identifier: string;

  /**
   * The terrain worker for the generator.
   * This is set by the worker decorator, which will create a worker thread for the generator.
   */
  public static _worker: typeof TerrainWorker | null = null;

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
   * The world of the generator.
   */
  public readonly world: World;

  /**
   * The properties of the generator.
   */
  public readonly properties: TerrainGeneratorProperties =
    DefaultTerrainGeneratorProperties;

  /**
   * The chunks that are queued for threaded generation.
   */
  public readonly queue = new Map<bigint, Chunk>();

  /**
   * The worker for the generator.
   */
  public readonly worker: Worker | null;

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
    this.world = dimension.world;

    // Set the properties of the generator.
    this.properties = { ...DefaultTerrainGeneratorProperties, ...properties };

    // Set the identifier of the generator.
    this.identifier = (this.constructor as typeof TerrainGenerator).identifier;

    // Initialize the worker if available.
    this.worker =
      (this.constructor as typeof TerrainGenerator)._worker?.initialize(
        this.properties
      ) ?? null;

    // Check if the worker is available and listen for messages.
    this.worker?.on("message", (chunk: Chunk & { identifier: string }) => {
      // Check if the identifier matches the generator.
      if (chunk.identifier !== this.identifier) return;

      // Process the chunk.
      this.process(chunk);
    });
  }

  /**
   * Generates a chunk at the specified coordinates.
   * @param _cx The chunk x coordinate.
   * @param _cz The chunk z coordinate.
   */
  public apply(_cx: number, _cz: number): Chunk {
    throw new Error(`${this.identifier}.apply() is not implemented!`);
  }

  /**
   * Handoff a chunk to the worker for generation.
   * @param chunk The chunk to handoff.
   */
  protected handoff(chunk: Chunk): void {
    // Check if the worker is available.
    if (!this.worker) throw new Error("Worker is not available.");

    // Add the chunk to the queue.
    this.queue.set(chunk.hash, chunk);

    // Separate the chunk data.
    const { x: cx, z: cz } = chunk;

    // Get the dimension type.
    const type = this.dimension.type;

    // Handoff the chunk generation to the worker thread.
    this.worker.postMessage({ generator: true, cx, cz, type });
  }

  /**
   * Processes a chunk that was generated by the worker.
   * @param chunk The chunk that was generated.
   */
  protected process(chunk: Chunk): void {
    // Find the queued chunk from the set.
    const queued = this.queue.get(chunk.hash);

    // Check if the chunk was found.
    if (!queued) return;

    // Update the queued chunk with the generated data.
    // Since workers are not allowed to transfer class instances, we need to manually copy the data.
    for (const sub of chunk.subchunks) {
      // Continue if the subchunk is null.
      if (!sub) continue;

      // Get the subchunk from the queued chunk.
      const subchunk = queued.getSubChunk(chunk.subchunks.indexOf(sub));

      // Loop through the layers and copy the data.
      for (const lay of sub.layers) {
        // Get the layer from the queued
        const layer = subchunk.getLayer(sub.layers.indexOf(lay));

        // Copy the block data.
        for (const [index, block] of lay.blocks.entries()) {
          layer.blocks[index] = block;
        }

        // Copy the palette data.
        for (const [index, block] of lay.palette.entries()) {
          layer.palette[index] = block;
        }
      }
    }

    // Now we can mark the chunk as ready.
    queued.ready = true;

    // Create a new ChunkReadySignal for the chunk.
    new ChunkReadySignal(this.dimension, queued).emit();

    // Remove the chunk from the queue.
    this.queue.delete(chunk.hash);
  }
}

export { TerrainGenerator };
