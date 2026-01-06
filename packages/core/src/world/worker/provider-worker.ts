import { threadId, Worker } from "node:worker_threads";

import { DimensionType } from "@serenityjs/protocol";

import { Chunk } from "../chunk";

import { WorkerMessage } from "./message";
import { WorkerMessageType } from "./message-type";
import { MessageQueue } from "./message-queue";

import type { WorldProvider } from "../provider";

class ProviderWorker {
  /**
   * The path of the worker file.
   */
  public static path = __filename;

  public readonly properties: Array<unknown>;

  public readonly parent: typeof WorldProvider;

  public readonly messages = new MessageQueue();

  /**
   * Creates a new provider worker instance.
   */
  public constructor(parent: typeof WorldProvider, properties: Array<unknown>) {
    // Set the properties of the worker
    this.properties = properties;

    // Set the parent provider of the worker
    this.parent = parent;
  }

  /**
   * Called when the worker is shutting down.
   */
  public onShutdown(): void {}

  /**
   * Reads a chunk at the specified coordinates.
   * @param cx The chunk x coordinate.
   * @param cz The chunk z coordinate.
   * @param dimension The dimension index of the chunk.
   * @param type The dimension type of the chunk.
   * @return The chunk at the specified coordinates, or null if it does not exist.
   */
  public async readChunk(
    _cx: number,
    _cz: number,
    _type: DimensionType,
    _dimension: number
  ): Promise<Chunk | null> {
    throw new Error(
      `${this.parent.identifier}.readChunk() is not implemented!`
    );
  }

  public async onParentMessage(
    message: WorkerMessage
  ): Promise<WorkerMessage | void> {
    // Switch on the message type
    switch (message.type) {
      case WorkerMessageType.ReadChunk: {
        // Cast the message to a read chunk request.
        const request = message as WorkerMessage<WorkerMessageType.ReadChunk>;

        // Get the data from the request.
        const { cx, cz, type, dimension } = request.data;

        // Read the chunk from the provider
        const chunk = await this.readChunk(cx, cz, type, dimension ?? 0);

        // Check if no chunk was found
        if (!chunk) {
          // Return a null response message
          return {
            identifier: this.parent.identifier,
            type: WorkerMessageType.ReadChunkResponseNull,
            data: { cx, cz, type }
          };
        }

        console.log("read chunk in provider worker", { cx, cz, dimension });

        // Serialize the chunk to a buffer.
        const buffer = Chunk.serialize(chunk);

        // Return the response message.
        return {
          identifier: this.parent.identifier,
          type: WorkerMessageType.ReadChunkResponse,
          data: { cx, cz, type, buffer }
        };
      }

      case WorkerMessageType.Shutdown: {
        // Cast the message to a shutdown message.
        const shutdownMessage =
          message as WorkerMessage<WorkerMessageType.Shutdown>;

        // Verify the threadId matches
        if (shutdownMessage.data.threadId !== threadId) break;

        // Call the shutdown handler
        return this.onShutdown();
      }
    }
  }

  /**
   * Initializes the worker thread.
   * @param properties The properties to use for the worker.
   */
  public static initialize(_properties: Array<unknown>): Worker {
    throw new Error(`${this.name}.initialize() is not implemented!`);
  }
}

export { ProviderWorker };
