import {
  BlockActorDataPacket,
  ChunkCoords,
  DataPacket,
  IPosition,
  LevelChunkPacket,
  NetworkChunkPublisherUpdatePacket,
  UpdateBlockPacket
} from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { Chunk } from "../../../world/chunk";
import { EntityDespawnOptions } from "../../../types";
import { Dimension } from "../../../world";

import { PlayerTrait } from "./trait";

class PlayerChunkRenderingTrait extends PlayerTrait {
  public static readonly identifier = "chunk_rendering";
  public static readonly types = [EntityIdentifier.Player];

  /**
   * The current chunk hashes that have been sent to the player.
   */
  public readonly chunks = new Set<bigint>();

  /**
   * The view distance of the player.
   */
  public viewDistance = this.player.dimension.viewDistance;

  /**
   * A cache of radial offsets for different view distances.
   */
  private readonly offsetCache = new Map<number, Int16Array>();

  /**
   * The set of chunk hashes that are pending to be sent to the player.
   */
  private readonly pending = new Set<bigint>();

  /**
   * Increments to cancel any in-flight send() loops.
   */
  private sendGeneration = 0;

  /**
   * The last chunk position where we sent a NetworkChunkPublisherUpdatePacket.
   * Used to detect when the player has moved significantly.
   */
  private lastUpdatePosition: { x: number; z: number } | null = null;

  /**
   * The tick counter for periodic updates.
   */
  private updateTickCounter = 0;

  /**
   * Flag to indicate if a tick is currently in progress.
   */
  private tickInProgress = false;

  /**
   * The queue of chunks to be sent to the player.
   */
  private chunkQueue: Array<Chunk> = [];

  /**
   * Sends a chunk to the player.
   * @param chunks The chunks to send to the player.
   */
  public async send(
    dimension: Dimension,
    ...chunks: Array<Chunk>
  ): Promise<void> {
    // Capture the current generation
    const gen = this.sendGeneration;

    // Calculate the amount and batches
    const amount = chunks.length;
    const batches = Math.ceil(amount / this.viewDistance);

    // Iterate over each batch
    for (let index = 0; index < batches; index++) {
      // Check if the generation has changed
      if (gen !== this.sendGeneration) return;

      // Check if the player is still alive and in the same dimension
      if (!this.entity.isAlive || dimension !== this.dimension) return;

      // Calculate the start and end indices for the batch
      const start = index * this.viewDistance;
      const end = Math.min(start + this.viewDistance, amount);
      const packets: Array<DataPacket> = [];
      const batch = chunks.slice(start, end);

      // Process each chunk in the batch
      for (const chunk of batch) {
        // Check if the generation has changed
        if (gen !== this.sendGeneration) return;

        // Check if the player is still in the same dimension
        if (dimension !== this.dimension) return;

        // Check if the chunk is already sent
        if (!this.chunks.has(chunk.hash)) {
          // Mark the chunk as sent
          this.chunks.add(chunk.hash);

          // No longer pending
          this.pending.delete(chunk.hash);

          // Notify the dimension that the chunk is now watched
          this.dimension.onChunkWatched(chunk.hash);
        }
      }

      // Create the NetworkChunkPublisherUpdatePacket
      const update = new NetworkChunkPublisherUpdatePacket();
      update.radius = this.viewDistance << 4;
      update.coordinate = this.player.position.floor();
      update.savedChunks = this.getChunksWithinViewDistance();

      // Iterate over each chunk in the batch again to create packets
      for (const chunk of batch) {
        // Check if the generation has changed
        if (gen !== this.sendGeneration) return;

        // Check if the player is still in the same dimension
        if (dimension !== this.dimension) return;

        // Create the LevelChunkPacket for the chunk
        const packet = new LevelChunkPacket();
        packet.x = chunk.x;
        packet.z = chunk.z;
        packet.dimension = chunk.type;
        packet.subChunkCount = chunk.getSubChunkSendCount();
        packet.cacheEnabled = false;
        packet.data = Chunk.serialize(chunk);
        packets.push(packet);

        // Iterate over each block storage in the chunk to send BlockActorDataPackets
        for (const storage of chunk.getAllBlockStorages()) {
          // Check if the storage has any data
          if (storage.size === 0) continue;

          // Create the BlockActorDataPacket for the storage
          const packet = new BlockActorDataPacket();
          packet.position = storage.getPosition();
          packet.nbt = storage;
          packets.push(packet);

          // Push tile fix packets
          packets.push(...this.getTileFixPackets(storage.getPosition()));
        }
      }

      // Final cancel check before sending
      if (gen !== this.sendGeneration) return;

      // Send all packets to the player
      this.player.send(...packets, update);

      // Await the next tick before sending the next batch
      await new Promise((resolve) =>
        this.dimension.schedule(1, resolve as () => void)
      );

      // Final cancel check after sending
      if (gen !== this.sendGeneration) return;
    }
  }

  /**
   * Checks if a chunk has been sent to the player.
   * @param hash The hash of the chunk to check.
   * @returns True if the chunk has been sent, false otherwise.
   */
  public sent(hash: bigint): boolean {
    return this.chunks.has(hash);
  }

  /**
   * Gets the distance between the player and a chunk.
   * @param chunk The hash of the chunk to get the distance to.
   * @returns The distance between the player and the chunk.
   */
  public distance(hash: bigint): number {
    // Convert the chunk hash to a chunk position
    const { x: cx, z: cz } = ChunkCoords.unhash(hash);

    // Get the player's chunk position
    const px = this.player.position.x >> 4;
    const pz = this.player.position.z >> 4;

    // Calculate the Euclidean distance between the player and the chunk
    return Math.hypot(cx - px, cz - pz);
  }

  /**
   * Gets the next set of chunk hashes to send to the player.
   * @note This method obtains the chunks that are within the player's view distance.
   * @param out The output array to store the chunk hashes.
   * @param distance The distance to calculate the chunks for.
   * @returns An array of chunk hashes to send to the player.
   */
  public async next(out: Array<Chunk>, distance?: number): Promise<void> {
    // Get the current generation
    const gen = this.sendGeneration;

    // Calculate the player's current chunk position
    const cx = this.player.position.x >> 4;
    const cz = this.player.position.z >> 4;

    // Calculate the distance to get chunks for
    const d = Math.floor(distance ?? this.viewDistance);
    const offsets = this.getRadialOffsets(d);

    // Iterate over all chunks within the specified distance
    for (let i = 0; i < offsets.length; i += 2) {
      // Check if the generation has changed
      if (gen !== this.sendGeneration) return;

      // Calculate the chunk coordinates
      const x = cx + offsets[i]!;
      const z = cz + offsets[i + 1]!;
      const hash = ChunkCoords.hash({ x, z });

      // Already tracked or already queued to send
      if (this.chunks.has(hash) || this.pending.has(hash)) continue;

      // Fetch the chunk asynchronously
      const chunk = await this.player.dimension.getChunkAsync(x, z);

      // Mark as pending so we don't re-queue it next tick
      this.pending.add(chunk.hash);

      // Add the chunk to the output array
      out.push(chunk);
    }
  }

  /**
   * Clears the chunks from the player's view.
   * @param position The position of the chunk to clear.
   */
  public clear(position?: ChunkCoords): void {
    // Calculate which chunks to clear
    const coords = position
      ? [position]
      : [...this.chunks].map((hash) => ChunkCoords.unhash(hash));

    // Create an empty chunk for clearing
    const empty = new Chunk(0, 0, this.player.dimension.type);

    // Iterate over each chunk coordinate to clear
    for (const coord of coords) {
      // Create a LevelChunkPacket with empty data
      const packet = new LevelChunkPacket();
      packet.x = coord.x; // Set chunk X coordinate
      packet.z = coord.z; // Set chunk Z coordinate
      packet.dimension = this.player.dimension.type;
      packet.subChunkCount = empty.getSubChunkSendCount();
      packet.cacheEnabled = false;
      packet.data = Chunk.serialize(empty);

      // Send the empty chunk to the player
      this.player.send(packet);

      // Remove the chunk from the tracked set
      const hash = ChunkCoords.hash(coord);
      if (this.chunks.delete(hash)) {
        // Notify the dimension that the chunk is no longer watched
        this.dimension.onChunkUnwatched(hash);
      }

      // Also remove from pending if it was queued
      this.pending.delete(hash);
    }
  }

  public async onTick(): Promise<void> {
    // Check if a tick is already in progress
    if (this.tickInProgress) return;
    this.tickInProgress = true;

    try {
      // Check if the player is spawned
      if (!this.player.isAlive) return;

      // First, flush any queued chunks from the last tick
      await this.flushChunkQueue();

      // Always check if any chunks need to be removed from the player's view
      // This should happen regardless of whether we're sending new chunks
      const chunksToRemove: Array<ChunkCoords> = [];
      for (const hash of this.chunks) {
        // Get the distance between the player and the chunk
        const distance = this.distance(hash);

        // Check if the chunk is outside of the player's view distance
        if (distance > this.viewDistance + 0.5) {
          // Get the chunk position
          const { x, z } = ChunkCoords.unhash(hash);
          chunksToRemove.push({ x, z });
        }
      }

      // Remove chunks that are outside view distance
      if (chunksToRemove.length > 0) {
        for (const coord of chunksToRemove) {
          this.clear(coord);
        }
      }

      // Get the next set of chunks to send
      await this.next(this.chunkQueue);

      // No new chunks to send, but we should periodically update the chunk publisher
      // to ensure the client knows which chunks to keep loaded
      this.updateTickCounter++;
      const currentChunkX = this.player.position.x >> 4;
      const currentChunkZ = this.player.position.z >> 4;

      // Update if player moved significantly (more than 2 chunks) or every 20 ticks
      const shouldUpdate =
        !this.lastUpdatePosition ||
        Math.abs(this.lastUpdatePosition.x - currentChunkX) > 2 ||
        Math.abs(this.lastUpdatePosition.z - currentChunkZ) > 2 ||
        this.updateTickCounter >= 20;

      // Check if we should update the chunk publisher
      if (shouldUpdate) {
        this.updateChunkPublisher();
        this.lastUpdatePosition = { x: currentChunkX, z: currentChunkZ };
        this.updateTickCounter = 0;
      }
    } finally {
      // Reset the tick in progress flag
      this.tickInProgress = false;
    }
  }

  /**
   * Flushes the chunk queue by sending all queued chunks to the player.
   * @returns A promise that resolves when all queued chunks have been sent.
   */
  private async flushChunkQueue(): Promise<void> {
    // Check if there are any chunks to send
    if (this.chunkQueue.length === 0) return;

    // Snapshot queue and clear immediately
    const toSend = this.chunkQueue;
    this.chunkQueue = [];

    // Send the chunks
    await this.send(this.dimension, ...toSend);
  }

  /**
   * Gets all chunks within the player's view distance.
   * @returns An array of chunk coordinates that should be kept loaded.
   */
  private getChunksWithinViewDistance(): Array<ChunkCoords> {
    const chunks: Array<ChunkCoords> = [];
    const cx = this.player.position.x >> 4;
    const cz = this.player.position.z >> 4;
    const d = Math.floor(this.viewDistance);

    // Get the radial offsets for the distance
    const offsets = this.getRadialOffsets(d);

    // Iterate over all chunks within view distance
    for (let i = 0; i < offsets.length; i += 2) {
      const x = cx + offsets[i]!;
      const z = cz + offsets[i + 1]!;
      const hash = ChunkCoords.hash({ x, z });

      // Only include chunks that have been sent to the player
      if (this.chunks.has(hash)) {
        chunks.push({ x, z });
      }
    }

    return chunks;
  }

  /**
   * Updates the NetworkChunkPublisherUpdatePacket with all chunks within view distance.
   * This tells the client which chunks to keep loaded and which to unload.
   */
  private updateChunkPublisher(): void {
    // Create a new NetworkChunkPublisherUpdatePacket
    const update = new NetworkChunkPublisherUpdatePacket();
    update.radius = this.viewDistance << 4;
    update.coordinate = this.player.position.floor();
    update.savedChunks = this.getChunksWithinViewDistance();

    // Send the update to the player
    this.player.send(update);
  }

  private getRadialOffsets(d: number): Int16Array {
    // Check if we have the offsets cached
    const cached = this.offsetCache.get(d);
    if (cached) return cached; // Return cached offsets if available

    const r2 = (d + 0.5) * (d + 0.5);

    // Worst case (full square): (2d+1)^2 entries; store as [dx, dz] pairs
    const tmp: Array<[number, number, number]> = [];
    for (let dx = -d; dx <= d; dx++) {
      for (let dz = -d; dz <= d; dz++) {
        const dist2 = dx * dx + dz * dz;
        if (dist2 <= r2) tmp.push([dist2, dx, dz]);
      }
    }
    // Radial order without sqrt
    tmp.sort((a, b) => a[0] - b[0]);

    // Pack into a compact typed array: [dx0, dz0, dx1, dz1, ...]
    const packed = new Int16Array(tmp.length * 2);
    for (let i = 0, j = 0; i < tmp.length; i++) {
      packed[j++] = tmp[i]![1];
      packed[j++] = tmp[i]![2];
    }

    this.offsetCache.set(d, packed);
    return packed;
  }

  public getTileFixPackets(position: IPosition): Array<DataPacket> {
    // Fetch the block at the position
    const block = this.dimension.getBlock(position);

    // Create two UpdateBlockPackets to fix tile entities
    const packet1 = new UpdateBlockPacket();
    packet1.position = block.position;
    packet1.layer = 0;
    packet1.flags = 0;
    packet1.networkBlockId = 0;

    const packet2 = new UpdateBlockPacket();
    packet2.position = block.position;
    packet2.layer = 0;
    packet2.flags = 0;
    packet2.networkBlockId = block.permutation.networkId;

    // Return the packets
    return [packet1, packet2];
  }

  public onRemove(): void {
    // Clear the chunks from the player's view
    this.clear();
  }

  public onDespawn(options: EntityDespawnOptions): void {
    // Clear the chunks from the player's view if the player has not died
    if (!options.hasDied || options.changedDimensions) this.clear();
  }

  public onTeleport(): void {
    // Cancel any in-flight send() loops
    this.sendGeneration++;

    // Clear the pending chunks & queue
    this.pending.clear();
    this.chunkQueue = [];

    // Reset the update position to force an immediate update
    this.lastUpdatePosition = null;
    this.updateTickCounter = 0;
  }

  /**
   * The number of chunks to send in each batch.
   * @returns The number of chunks to send in each batch.
   */
  public getviewDistance(): number {
    return this.viewDistance;
  }

  /**
   * Sets the number of chunks to send in each batch.
   * @param size The number of chunks to send in each batch.
   */
  public setviewDistance(size: number): void {
    this.viewDistance = size;
  }
}

export { PlayerChunkRenderingTrait };
