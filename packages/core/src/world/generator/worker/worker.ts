import { isMainThread, type Worker } from "node:worker_threads";

import { TerrainGeneratorProperties } from "../../../types";

import type { TerrainGenerator } from "../generator";
import type { DimensionType } from "@serenityjs/protocol";
import type { Chunk } from "../../chunk";

class TerrainWorker {
  /**
   * The path of the worker file.
   */
  public static path = __filename;

  /**
   * The properties of the worker.
   */
  public readonly properties: TerrainGeneratorProperties;

  /**
   * The generator for the worker.
   */
  public readonly generator: typeof TerrainGenerator;

  /**
   * Creates a new worker instance.
   */
  public constructor(
    generator: typeof TerrainGenerator,
    properties: TerrainGeneratorProperties
  ) {
    // Check if we are in the main thread
    if (isMainThread)
      throw new Error("Worker can only be initialized in a worker thread");

    // Set the properties of the worker
    this.properties = properties;

    // Set the generator of the worker
    this.generator = generator;
  }

  /**
   * Generates a chunk at the specified coordinates.
   * @param _cx The chunk x coordinate.
   * @param _cz  The chunk z coordinate.
   * @param _type The dimension type of the chunk.
   */
  public apply(_cx: number, _cz: number, _type: DimensionType): Chunk {
    throw new Error(`${this.generator.identifier}.apply() is not implemented!`);
  }

  /**
   * Initializes the worker thread.
   * @param properties The properties to use for the worker.
   */
  public static initialize(_properties: TerrainGeneratorProperties): Worker {
    throw new Error(`${this.name}.initialize() is not implemented!`);
  }
}

export { TerrainWorker };
