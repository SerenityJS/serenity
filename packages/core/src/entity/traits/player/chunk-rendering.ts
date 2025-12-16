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
   * The number of chunks currently being sent to the player.
   */
  private sendingQueue = 0;

  /**
   * Sends a chunk to the player.
   * @param chunks The chunks to send to the player.
   */
  public async send(
    dimension: Dimension,
    ...chunks: Array<Chunk>
  ): Promise<void> {
    // Get the amount of chunks to send
    const amount = (this.sendingQueue = chunks.length);

    // We want to send the chunks in batches of 8
    const batches = Math.ceil(amount / 8);

    // Iterate over the batches
    for (let index = 0; index < batches; index++) {
      // Check if there are still chunks to send
      if (!this.entity.isAlive || dimension !== this.dimension) return;

      // Get the start and end index of the batch
      const start = index * 8;
      const end = Math.min(start + 8, amount);

      // Create a new NetworkChunkPublisherUpdatePacket
      const update = new NetworkChunkPublisherUpdatePacket();
      update.radius = this.viewDistance << 4;
      update.coordinate = this.player.position.floor();
      update.savedChunks = []; // Prepare an array to hold the chunk coordinates

      // Create an array to hold the packets to send
      const packets: Array<DataPacket> = [];

      // Get the chunks to send
      const batch = chunks.slice(start, end);
      for (const chunk of batch) {
        // Check if the sending queue is cleared
        if (dimension !== this.dimension) return;

        // Add the chunk to the player's view
        this.chunks.add(chunk.hash);

        // Push the chunk to the update packet
        update.savedChunks.push({ x: chunk.x, z: chunk.z });

        // Create a new LevelChunkPacket
        const packet = new LevelChunkPacket();

        // Assign the chunk data to the packet
        packet.x = chunk.x;
        packet.z = chunk.z;
        packet.dimension = chunk.type;
        packet.subChunkCount = chunk.getSubChunkSendCount();
        packet.cacheEnabled = false;
        packet.data = Chunk.serialize(chunk);

        // Rent the chunk from the provider
        this.dimension.world.provider.rentChunk(chunk.hash, this.dimension);

        // Add the packet to the packets array
        packets.push(packet);

        // Iterate over the block storages in the chunk to ensure they are loaded
        for (const storage of chunk.getAllBlockStorages()) {
          // Check if the block storage has data
          if (storage.size === 0) continue;

          // Create a new BlockActorData packet
          const packet = new BlockActorDataPacket();

          // Assign the packet values
          packet.position = storage.getPosition();
          packet.nbt = storage;

          // Add the block packet to the packets array
          packets.push(packet);

          // Push tile fix packets
          packets.push(...this.getTileFixPackets(storage.getPosition()));
        }
      }

      // Send the packets to the player
      this.player.send(...packets, update);

      // Decrease the sending queue
      this.sendingQueue -= batch.length;

      // Schedule the next batch on the next tick
      await new Promise((resolve) =>
        // Resolve on the next tick of the dimension
        this.dimension.schedule(1, resolve as () => void)
      );
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
   * @param distance The distance to calculate the chunks for.
   * @returns An array of chunk hashes to send to the player.
   */
  public next(distance?: number): Array<Chunk> {
    // Get the player's current chunk position
    const cx = this.player.position.x >> 4;
    const cz = this.player.position.z >> 4;

    // Use the player's view distance if no distance is provided
    const d = Math.floor(distance ?? this.viewDistance);

    // Get the radial offsets for the distance
    const offsets = this.getRadialOffsets(d);
    const out: Array<Chunk> = [];

    // Stream candidates in near→far order; no nested loops, no sort, no sqrt
    for (let i = 0; i < offsets.length; i += 2) {
      // Get the chunk coordinates
      const x = cx + offsets[i]!;
      const z = cz + offsets[i + 1]!;

      // Calculate the hash of the chunk
      const hash = ChunkCoords.hash({ x, z });

      // Skip if we've already sent this chunk
      if (this.chunks.has(hash)) continue;

      // Get the chunk from the dimension
      const chunk = this.player.dimension.getChunk(x, z);
      if (this.chunks.has(chunk.hash)) continue; // Skip if the chunk is not ready

      // Add the chunk if it hasn't been sent to the player yet
      out.push(chunk);
    }

    // Return the chunks
    return out;
  }

  /**
   * Clears the chunks from the player's view.
   * @param position The position of the chunk to clear.
   */
  public clear(position?: ChunkCoords): void {
    // Clear the sending queue
    this.sendingQueue = 0;

    // Convert the hashes to coordinates
    const coords = position
      ? [position]
      : [...this.chunks].map((hash) => ChunkCoords.unhash(hash));

    // Create an empty chunk
    const empty = new Chunk(0, 0, this.player.dimension.type);

    // Iterate over the coordinates
    for (const coord of coords) {
      // Create a new LevelChunkPacket
      const packet = new LevelChunkPacket();

      // Assign the chunk data to the packet
      packet.x = coord.x;
      packet.z = coord.z;
      packet.dimension = this.player.dimension.type;
      packet.subChunkCount = empty.getSubChunkSendCount();
      packet.cacheEnabled = false;
      packet.data = Chunk.serialize(empty);

      // Send the packet to the player
      this.player.send(packet);

      // Get the hash of the chunk
      const hash = ChunkCoords.hash(coord);

      // Return the chunk to the provider
      this.dimension.world.provider.returnChunk(hash, this.dimension);

      // Remove the chunk from the player's view
      this.chunks.delete(hash);
    }
  }

  public async onTick(): Promise<void> {
    // Check if the player is spawned
    if (!this.player.isAlive) return;

    // Check if we are still sending chunks
    if (this.sendingQueue > 0) {
      // Check if any chunks need to be removed from the player's view
      for (const hash of this.chunks) {
        // Get the distance between the player and the chunk
        const distance = this.distance(hash);

        // Check if the chunk is outside of the player's view distance
        if (distance > this.viewDistance + 0.5) {
          // Get the chunk position
          const { x, z } = ChunkCoords.unhash(hash);

          // Clear the chunk from the player's view
          this.clear({ x, z });
        }
      }
    }
    // If not, get the next set of chunks to send
    else {
      // Get the next set of chunks to send
      const chunks = this.next();

      // Check if there are any chunks to send
      if (chunks.length > 0) await this.send(this.dimension, ...chunks);
    }
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
    // Reset the sending queue
    if (this.sendingQueue > 0) this.sendingQueue = 0;
  }
}

export { PlayerChunkRenderingTrait };
