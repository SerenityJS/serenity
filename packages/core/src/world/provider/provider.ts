import { Worker } from "node:worker_threads";

import { CompoundTag } from "@serenityjs/nbt";
import { ChunkCoords } from "@serenityjs/protocol";

import { BlockLevelStorage } from "../../block";
import { Serenity } from "../../serenity";
import { WorldProperties, WorldProviderProperties } from "../../types";
import { Chunk } from "../chunk/chunk";
import { Dimension } from "../dimension";
import { World } from "../world";
import { ProviderWorker } from "../worker";
import { WorkerMessage } from "../worker/message";
import { WorkerMessageType } from "../worker/message-type";

/**
 * The default world provider properties.
 */
const DefaultWorldProviderProperties: WorldProviderProperties = {
  path: "./worlds"
};

class WorldProvider {
  /**
   * The identifier of the provider.
   */
  public static readonly identifier: string;

  /**
   * The provider worker for the provider, if applicable.
   */
  public static worker: typeof ProviderWorker | null = null;

  /**
   * The identifier of the provider.
   */
  public readonly identifier = (this.constructor as typeof WorldProvider)
    .identifier;

  /**
   * The cached chunks for the provider.
   */
  public readonly chunks = new WeakMap<Dimension, Map<bigint, Chunk>>();

  /**
   * The barrowers map for the provider.
   */
  public readonly barrowers = new WeakMap<Dimension, Map<bigint, number>>();

  /**
   * The chunk queue for the provider.
   */
  public readonly chunkQueue = new Map<
    bigint,
    { resolve: (chunk: Chunk) => void; dimension: Dimension }
  >();

  /**
   * The world that the provider belongs to.
   */
  public world!: World;

  /**
   * The worker thread for the provider, if applicable.
   */
  public readonly worker: Worker | null = null;

  /**
   * Create a new world provider.
   * @param parameters The parameters to use for the provider.
   */
  public constructor(...parameters: Array<unknown>) {
    // Get the generator prototype.
    const prototype = this.constructor as typeof WorldProvider;

    // Check if the provider has a worker
    if (prototype.worker) {
      // If so, initialize the worker with the provided parameters
      this.worker = prototype.worker.initialize(parameters);

      // Listen for messages from the worker
      this.worker.on("message", async (message: WorkerMessage) => {
        // Check if the identifier matches the provider's identifier.
        if (message.identifier !== this.identifier) return;

        // Handle the child message
        await this.onChildMessage(message);
      });
    }
  }

  /**
   * Called when the provider is started.
   */
  public onStartup(): void {}

  /**
   * Called when the provider is shutdown.
   */
  public onShutdown(): void {
    // Check if a worker exists for the provider
    if (this.worker) {
      // Post a shutdown message to the worker
      this.worker.postMessage({
        identifier: this.identifier,
        type: WorkerMessageType.Shutdown,
        data: { threadId: this.worker.threadId }
      });

      // Terminate the worker thread
      this.worker.terminate();
    }
  }

  /**
   * Called when the provider is saved.
   */
  public onSave(): void {}

  /**
   * Reads a buffer from the provider.
   * @param key The key to read the buffer from.
   * @returns The buffer data entry.
   */
  public readBuffer(_key: string): Buffer {
    throw new Error(`${this.identifier}.readBuffer() is not implemented!`);
  }

  /**
   * Writes a buffer to the provider.
   * @param key The key to write the buffer to.
   * @param value The buffer data to write.
   */
  public writeBuffer(_key: string, _value: Buffer): void {
    throw new Error(`${this.identifier}.writeBuffer() is not implemented!`);
  }

  /**
   * Read a chunk for a specified dimension from the provider.
   * @param chunk The chunk where the data will be written to.
   * @param dimension The dimension to read the chunk from.
   */
  public async readChunk(_chunk: Chunk, _dimension: Dimension): Promise<Chunk> {
    throw new Error(`${this.identifier}.readChunk() is not implemented!`);
  }

  protected async handoffReadChunk(
    chunk: Chunk,
    dimension: Dimension
  ): Promise<Chunk> {
    // Check if a worker is available for the provider.
    if (!this.worker) {
      throw new Error(
        `No worker available for provider ${this.identifier} to handoff readChunk()`
      );
    }

    // Create and return a promise that resolves when the worker is done.
    return new Promise<Chunk>((resolve) => {
      // Generate the hash for the chunk.
      const hash = ChunkCoords.hash({ x: chunk.x, z: chunk.z });

      const hasChunkInQueue = this.chunkQueue.has(hash);

      // // Check if the chunk is already in the queue.
      // if (!this.chunkQueue.has(hash)) {
      //   // Fetch and return the existing promise for the chunk.
      //   const existing = this.chunkQueue.get(hash);

      //   // Return the existing promise's resolve function.
      //   if (existing) return existing.resolve;
      // }

      // Add the chunk to the queue.
      this.chunkQueue.set(hash, { resolve, dimension });

      if (!hasChunkInQueue) {
        // Create the message to send to the worker.
        const message: WorkerMessage<WorkerMessageType.ReadChunk> = {
          identifier: this.identifier,
          type: WorkerMessageType.ReadChunk,
          data: {
            cx: chunk.x,
            cz: chunk.z,
            type: dimension.type,
            dimension: dimension.indexOf()
          }
        };

        // Send the message to the worker.
        this.worker?.postMessage(message);
      }
    });
  }

  protected async onChildMessage(message: WorkerMessage): Promise<void> {
    // Switch on the message type
    switch (message.type) {
      case WorkerMessageType.ReadChunkResponse: {
        // Cast the message to a read chunk response.
        const response =
          message as WorkerMessage<WorkerMessageType.ReadChunkResponse>;

        // Destructure the data from the response.
        const data = response.data;

        // Convert the Uint8Array to a Buffer.
        const buffer = Buffer.from(data.buffer);

        // Deserialize the chunk from the buffer.
        const chunk = Chunk.deserialize(data.type, data.cx, data.cz, buffer);

        // Generate the hash for the chunk.
        const hash = ChunkCoords.hash({ x: data.cx, z: data.cz });

        // Check if the chunk is in the queue.
        const resolver = this.chunkQueue.get(hash);
        if (resolver) {
          // Check if the dimension map exists
          if (!this.chunks.has(resolver.dimension)) {
            // Set the chunk in the dimension map
            this.chunks.set(resolver.dimension, new Map());
          }

          // Get the chunks map for the dimension
          const chunks = this.chunks.get(resolver.dimension)!;

          // Add the chunk to the provider's cache
          chunks.set(hash, chunk);

          console.log("resolving chunk from worker", {
            hash,
            dimension: resolver.dimension.indexOf()
          });

          // Resolve the chunk promise.
          resolver.resolve(chunk);

          // Remove the chunk from the queue.
          this.chunkQueue.delete(hash);
        }

        break;
      }

      case WorkerMessageType.ReadChunkResponseNull: {
        // Cast the message to a read chunk response null.
        const response =
          message as WorkerMessage<WorkerMessageType.ReadChunkResponseNull>;

        // Destructure the data from the response.
        const data = response.data;

        // Generate the hash for the chunk.
        const hash = ChunkCoords.hash({
          x: data.cx,
          z: data.cz
        });

        // Check if the chunk is in the queue.
        const resolver = this.chunkQueue.get(hash);
        if (resolver) {
          // Check if the dimension map exists
          if (!this.chunks.has(resolver.dimension)) {
            // Set the chunk in the dimension map
            this.chunks.set(resolver.dimension, new Map());
          }

          // Get the chunks map for the dimension
          const chunks = this.chunks.get(resolver.dimension)!;

          // Generate a chunk from the dimension.
          const chunk = await resolver.dimension.generator.apply(
            data.cx,
            data.cz
          );

          // Add the chunk to the provider's cache
          chunks.set(hash, chunk);

          // Resolve the chunk promise.
          resolver.resolve(chunk);

          // Remove the chunk from the queue.
          this.chunkQueue.delete(hash);
        }
      }
    }
  }

  /**
   * Writes a chunk for a specified dimension to the provider.
   * @param chunk The chunk to write.
   * @param dimension The dimension to write the chunk to.
   */
  public async writeChunk(_chunk: Chunk, _dimension: Dimension): Promise<void> {
    throw new Error(`${this.identifier}.writeChunk() is not implemented!`);
  }

  public readChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<CompoundTag> {
    throw new Error(`${this.identifier}.readEntities() is not implemented!`);
  }

  public writeChunkEntities(
    _chunk: Chunk,
    _dimension: Dimension,
    _entities: Array<[bigint, CompoundTag]>
  ): void {
    throw new Error(`${this.identifier}.writeEntities() is not implemented!`);
  }

  public readChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension
  ): Array<BlockLevelStorage> {
    throw new Error(`${this.identifier}.readBlocks() is not implemented!`);
  }

  public writeChunkBlocks(
    _chunk: Chunk,
    _dimension: Dimension,
    _blocks: Array<BlockLevelStorage>
  ): void {
    throw new Error(`${this.identifier}.writeBlocks() is not implemented!`);
  }

  /**
   * Reads a players data from the provider.
   * @param uuid The uuid of the player to read.
   * @returns The player data if found, otherwise null.
   */
  public readPlayer(_uuid: string): CompoundTag | null {
    throw new Error(`${this.identifier}.readPlayer() is not implemented!`);
  }

  /**
   * Writes a players data to the provider.
   * @param uuid The uuid of the player to write.
   * @param player The player data to write.
   */
  public writePlayer(_uuid: string, _player: CompoundTag): void {
    throw new Error(`${this.identifier}.writePlayer() is not implemented!`);
  }

  /**
   * Rents a chunk from the provider, this will increment the barrower count for the chunk.
   * @param hash The hash of the chunk to rent.
   * @param dimension The dimension to rent the chunk from.
   */
  public rentChunk(hash: bigint, dimension: Dimension): void {
    // Check if the dimension exists in the barrowers map
    if (!this.barrowers.has(dimension)) {
      // If not, create a new map for the dimension
      this.barrowers.set(dimension, new Map());
    }

    // Get the barrowers map for the dimension
    const barrowers = this.barrowers.get(dimension)!;

    // Increment the barrower count for the chunk
    const count = barrowers.get(hash) ?? 0;

    // Set the new count for the chunk
    barrowers.set(hash, count + 1);
  }

  /**
   * Returns a chunk to the provider, this will decrement the barrower count for the chunk.
   * @param hash The hash of the chunk to return.
   * @param dimension The dimension to return the chunk to.
   */
  public returnChunk(hash: bigint, dimension: Dimension): void {
    // Check if the dimension exists in the barrowers map
    if (!this.barrowers.has(dimension)) {
      // If not, create a new map for the dimension
      this.barrowers.set(dimension, new Map());
    }

    // Get the barrowers map for the dimension
    const barrowers = this.barrowers.get(dimension)!;

    // Decrement the barrower count for the chunk
    const count = barrowers.get(hash) ?? 0;

    // If the count is greater than 0, decrement it
    if (count > 0) {
      // Calculate the new count
      const newCount = count - 1;

      // Check if the new count is 0
      if (newCount === 0) {
        // Delete the chunk from the barrowers map
        barrowers.delete(hash);

        // Get the chunk from the provider
        const chunks = this.chunks.get(dimension);

        // If the chunks map does not exist, return
        if (!chunks) return;

        // Get the chunk from the chunks map
        const chunk = chunks.get(hash);

        // Skip if the chunk does not exist or is dirty
        if (!chunk || chunk.dirty) return;

        // Remove the chunk from the provider's cache
        chunks.delete(hash);
      } else {
        // Otherwise, set the new count for the chunk
        barrowers.set(hash, newCount);
      }
    }
  }

  /**
   * Initializes the provider with the specified properties.
   * @param serenity The serenity instance to use.
   * @param properties The properties to use for the provider.
   */
  public static async initialize(
    _serenity: Serenity,
    _properties: WorldProviderProperties
  ): Promise<void> {
    throw new Error(`${this.identifier}.initialize() is not implemented!`);
  }

  public static async create(
    _serenity: Serenity,
    _properties: WorldProviderProperties,
    _worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    throw new Error(`${this.identifier}.create() is not implemented!`);
  }

  /**
   * Loads a world from an existing path.
   * @param serenity The serenity instance to use.
   * @param path The path to load the world from.
   */
  public static async loadFromExistingPath(
    _serenity: Serenity,
    _path: string
  ): Promise<World> {
    throw new Error(
      `${this.identifier}.loadFromExistingPath() is not implemented!`
    );
  }

  /**
   * Creates a world from a given path.
   * @param serenity The serenity instance to use.
   * @param path The path to load the world from.
   * @param worldProperties The world properties to use for the world.
   */
  public static async createFromGivenPath(
    _serenity: Serenity,
    _path: string,
    _worldProperties?: Partial<WorldProperties>
  ): Promise<World> {
    throw new Error(
      `${this.identifier}.createFromGivenPath() is not implemented!`
    );
  }
}

export { WorldProvider, DefaultWorldProviderProperties };
