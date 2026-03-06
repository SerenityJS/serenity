import {
  BlockPosition,
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

  private emptyChunkData: Buffer | null = null;

  /**
   * Sends a chunk to the player.
   * @param chunks The chunks to send to the player.
   */
  public async send(
    dimension: Dimension,
    ...chunks: Array<Chunk>
  ): Promise<void> {
    const gen = this.sendGeneration;
    const amount = chunks.length;
    const batchSize = this.getChunkBatchSize();
    const batches = Math.ceil(amount / batchSize);

    for (let index = 0; index < batches; index++) {
      if (gen !== this.sendGeneration) return;
      if (!this.entity.isAlive || dimension !== this.dimension) return;

      const start = index * batchSize;
      const end = Math.min(start + batchSize, amount);
      const packets: Array<DataPacket> = [];

      for (let chunkIndex = start; chunkIndex < end; chunkIndex++) {
        const chunk = chunks[chunkIndex] as Chunk;

        if (gen !== this.sendGeneration) return;
        if (dimension !== this.dimension) return;

        if (!this.chunks.has(chunk.hash)) {
          this.chunks.add(chunk.hash);
          this.pending.delete(chunk.hash);
          this.dimension.onChunkWatched(chunk.hash);
        }
      }

      if (index === 0) packets.push(this.createChunkPublisherUpdatePacket());

      for (let chunkIndex = start; chunkIndex < end; chunkIndex++) {
        const chunk = chunks[chunkIndex] as Chunk;

        if (gen !== this.sendGeneration) return;
        if (dimension !== this.dimension) return;

        const packet = new LevelChunkPacket();
        packet.x = chunk.x;
        packet.z = chunk.z;
        packet.dimension = chunk.type;
        packet.subChunkCount = chunk.getSubChunkSendCount();
        packet.cacheEnabled = false;
        packet.data = Chunk.serialize(chunk);
        packets.push(packet);

        for (const storage of chunk.getAllBlockStorages()) {
          if (storage.size === 0) continue;

          const actorPacket = new BlockActorDataPacket();
          actorPacket.position = storage.getPosition();
          actorPacket.nbt = storage;
          packets.push(actorPacket);
          packets.push(...this.getTileFixPackets(storage.getPosition()));
        }
      }

      if (gen !== this.sendGeneration) return;
      this.player.send(...packets);

      await new Promise((resolve) =>
        this.dimension.schedule(1, resolve as () => void)
      );

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
  public async next(
    out: Array<Chunk>,
    distance?: number,
    limit = this.getChunkBatchSize()
  ): Promise<void> {
    const gen = this.sendGeneration;
    const cx = this.player.position.x >> 4;
    const cz = this.player.position.z >> 4;
    const d = Math.floor(distance ?? this.viewDistance);
    const offsets = this.getRadialOffsets(d);
    const targets: Array<{ x: number; z: number; hash: bigint }> = [];

    for (let i = 0; i < offsets.length; i += 2) {
      if (gen !== this.sendGeneration) return;

      const x = cx + offsets[i]!;
      const z = cz + offsets[i + 1]!;
      const hash = ChunkCoords.hash({ x, z });

      if (this.chunks.has(hash) || this.pending.has(hash)) continue;
      this.pending.add(hash);
      targets.push({ x, z, hash });

      if (targets.length >= limit) break;
    }

    if (targets.length === 0) return;

    const chunks = await Promise.all(
      targets.map(async ({ x, z, hash }) => {
        try {
          return await this.player.dimension.getChunkAsync(x, z);
        } catch {
          this.pending.delete(hash);
          return null;
        }
      })
    );

    if (gen !== this.sendGeneration) return;

    for (const chunk of chunks) if (chunk) out.push(chunk);
  }

  /**
   * Clears the chunks from the player's view.
   * @param position The position of the chunk to clear.
   */
  public clear(position?: ChunkCoords): void {
    const coords = position
      ? [position]
      : [...this.chunks].map((hash) => ChunkCoords.unhash(hash));

    if (!this.emptyChunkData) {
      const empty = new Chunk(0, 0, this.player.dimension.type);
      this.emptyChunkData = Chunk.serialize(empty);
    }

    for (const coord of coords) {
      const packet = new LevelChunkPacket();
      packet.x = coord.x;
      packet.z = coord.z;
      packet.dimension = this.player.dimension.type;
      packet.subChunkCount = 0;
      packet.cacheEnabled = false;
      packet.data = this.emptyChunkData as Buffer;

      this.player.send(packet);

      const hash = ChunkCoords.hash(coord);
      if (this.chunks.delete(hash)) {
        this.dimension.onChunkUnwatched(hash);
      }

      this.pending.delete(hash);
    }
  }

  public async onTick(): Promise<void> {
    if (this.tickInProgress) return;
    this.tickInProgress = true;

    try {
      if (!this.player.isAlive) return;

      await this.flushChunkQueue();

      const chunksToRemove: Array<ChunkCoords> = [];
      for (const hash of this.chunks) {
        const distance = this.distance(hash);

        if (distance > this.viewDistance + 0.5) {
          const { x, z } = ChunkCoords.unhash(hash);
          chunksToRemove.push({ x, z });
        }
      }

      if (chunksToRemove.length > 0) {
        for (const coord of chunksToRemove) {
          this.clear(coord);
        }
      }

      await this.next(this.chunkQueue);
      await this.flushChunkQueue();

      this.updateTickCounter++;
      const currentChunkX = this.player.position.x >> 4;
      const currentChunkZ = this.player.position.z >> 4;

      const shouldUpdate =
        !this.lastUpdatePosition ||
        Math.abs(this.lastUpdatePosition.x - currentChunkX) > 2 ||
        Math.abs(this.lastUpdatePosition.z - currentChunkZ) > 2 ||
        this.updateTickCounter >= 20;

      if (shouldUpdate) {
        this.updateChunkPublisher();
        this.lastUpdatePosition = { x: currentChunkX, z: currentChunkZ };
        this.updateTickCounter = 0;
      }
    } finally {
      this.tickInProgress = false;
    }
  }

  /**
   * Flushes the chunk queue by sending all queued chunks to the player.
   * @returns A promise that resolves when all queued chunks have been sent.
   */
  private async flushChunkQueue(): Promise<void> {
    if (this.chunkQueue.length === 0) return;

    const toSend = this.chunkQueue;
    this.chunkQueue = [];
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
    this.player.send(this.createChunkPublisherUpdatePacket());
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

  private createChunkPublisherUpdatePacket(): NetworkChunkPublisherUpdatePacket {
    const update = new NetworkChunkPublisherUpdatePacket();
    update.radius = this.viewDistance << 4;
    update.coordinate = this.player.position.floor();
    update.savedChunks = this.getChunksWithinViewDistance();
    return update;
  }

  private getChunkBatchSize(): number {
    return Math.max(1, Math.min(this.viewDistance, 8));
  }

  public getTileFixPackets(position: IPosition): Array<DataPacket> {
    const permutation = this.dimension.getPermutation(position);
    const blockPosition = BlockPosition.from(position);

    const packet1 = new UpdateBlockPacket();
    packet1.position = blockPosition;
    packet1.layer = 0;
    packet1.flags = 0;
    packet1.networkBlockId = 0;

    const packet2 = new UpdateBlockPacket();
    packet2.position = blockPosition;
    packet2.layer = 0;
    packet2.flags = 0;
    packet2.networkBlockId = permutation.networkId;

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
    this.emptyChunkData = null;

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
