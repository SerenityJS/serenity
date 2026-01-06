import { isMainThread, type Worker } from "node:worker_threads";

import { TerrainGeneratorProperties } from "../../types";
import { Chunk } from "../chunk";

import { WorkerMessage } from "./message";
import { WorkerMessageType } from "./message-type";
import { MessageQueue } from "./message-queue";

import type { DimensionType } from "@serenityjs/protocol";
import type { TerrainGenerator } from "../generator";

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
   * The parent generator for the worker.
   */
  public readonly parent: typeof TerrainGenerator;

  public readonly messages = new MessageQueue();

  /**
   * Creates a new worker instance.
   */
  public constructor(
    parent: typeof TerrainGenerator,
    properties: TerrainGeneratorProperties
  ) {
    // Check if we are in the main thread
    if (isMainThread)
      throw new Error("Worker can only be initialized in a worker thread");

    // Set the properties of the worker
    this.properties = properties;

    // Set the generator of the worker
    this.parent = parent;
  }

  /**
   * Generates a chunk at the specified coordinates.
   * @param _cx The chunk x coordinate.
   * @param _cz  The chunk z coordinate.
   * @param _type The dimension type of the chunk.
   */
  public async apply(
    _cx: number,
    _cz: number,
    _type: DimensionType
  ): Promise<Chunk> {
    throw new Error(`${this.parent.identifier}.apply() is not implemented!`);
  }

  /**
   * Handles an incoming message to the worker.
   * @param message The message received by the worker.
   * @returns The response message to be sent back.
   */
  public async onParentMessage(message: WorkerMessage): Promise<WorkerMessage> {
    // Switch the message type
    switch (message.type) {
      case WorkerMessageType.ReadChunk: {
        // Cast the message to the correct type
        const request = message as WorkerMessage<WorkerMessageType.ReadChunk>;

        // Destructure the data from the request
        const { cx, cz, type } = request.data;

        // Read the chunk from the generator
        const chunk = await this.apply(cx, cz, type);

        // Serialize the chunk into a buffer
        const buffer = Chunk.serialize(chunk);

        // Return the response message
        return {
          identifier: message.identifier,
          type: WorkerMessageType.ReadChunkResponse,
          data: {
            cx,
            cz,
            type,
            buffer
          }
        };
      }

      // Throw an error for unhandled message types
      default:
        throw new Error(`Unhandled worker message type: ${message.type}`);
    }
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
