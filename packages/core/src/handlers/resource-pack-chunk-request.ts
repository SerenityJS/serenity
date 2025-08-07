import {
  Packet,
  RequestedResourcePack,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { ResourcePack } from "../resources";
import { Player } from "../entity";
import { TickSchedule } from "../world";

interface PlayerPackQueue {
  packs: Array<RequestedResourcePack>;
  schedule?: TickSchedule;
}

class ResourcePackChunkRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ResourcePackChunkRequest;

  /**
   * A queue to keep track of resource pack chunk requests.
   */
  public readonly queue = new Map<Player, PlayerPackQueue>();

  public handle(
    packet: ResourcePackChunkRequestPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player already has a queue list
    if (!this.queue.has(player)) this.queue.set(player, { packs: [] }); // Set an empty queue for the player

    // Get the player's queue
    const queue = this.queue.get(player) as PlayerPackQueue;

    // Check if the player already has a schedule
    if (queue.schedule) {
      // Cancel the current download schedule
      queue.schedule.completeTick = player.world.currentTick + 25n;
    } else {
      // Create a new schedule for the player
      queue.schedule = player.world.schedule(25);

      // Add the schedule to the queue
      queue.schedule.on(this.sendQueuedPacks.bind(this, player));
    }

    // Prepare a flag to check if the pack is already in the queue
    let inQueue = false;

    // Add the requested pack to the queue if it is not already present
    for (const pack of queue.packs) {
      // Check if the pack is already in the queue
      if (
        pack.uuid === packet.pack.uuid &&
        pack.version === packet.pack.version
      ) {
        // If the pack is already in the queue, set inQueue to true
        inQueue = true;

        // Break the loop since we found the pack
        break;
      }
    }

    // If the pack is not in the queue, add it
    if (!inQueue) queue.packs.push(packet.pack);
  }

  /**
   * Starts sending the resource pack to the player.
   * @param pack The resource pack to send.
   * @param player The player to send the pack to.
   * @param chunk The chunk index to start sending from.
   */
  private async sendQueuedPacks(player: Player) {
    // Get the player's queue
    const queue = this.queue.get(player) as PlayerPackQueue;

    // Sort the packs from biggest to smallest by size
    const packs = queue.packs.sort((a, b) => {
      // Get the size of each pack from the resources
      const aSize = this.serenity.resources.packs.get(a.uuid)?.getSize() || 0;
      const bSize = this.serenity.resources.packs.get(b.uuid)?.getSize() || 0;
      return bSize - aSize; // Sort in descending order
    });

    // Iterate through all the packs in the queue
    for await (const { uuid } of packs) {
      // Get the pack from the resources
      const pack = this.serenity.resources.packs.get(uuid)!;

      // Send the resource pack to the player
      await this.sendResourcePack(player, pack);
    }

    // Delete the player's queue
    this.queue.delete(player);
  }

  private async sendResourcePack(
    player: Player,
    pack: ResourcePack,
    chunk: number = 0
  ): Promise<void> {
    return new Promise((resolve) => {
      // Get the maximum size of a chunk
      const maxChunkSize = this.serenity.resources.properties.chunkMaxSize;

      // Check if we are done sending chunks
      if (chunk >= pack.getChunkCount(maxChunkSize)) return resolve();

      // Create a new ResourcePackChunkDataPacket
      const chunkPacket = new ResourcePackChunkDataPacket();
      chunkPacket.packId = pack.uuid;
      chunkPacket.chunkId = chunk;
      chunkPacket.byteOffset = BigInt(chunk * maxChunkSize);
      chunkPacket.chunkData = pack.getChunk(chunk, maxChunkSize);

      // Check if the player is still connected
      if (!this.serenity.players.has(player.connection)) return resolve();

      // Send the packet to the player
      player.sendImmediate(chunkPacket);

      // Log the sending of the chunk
      this.serenity.logger.debug(
        `Sending chunk ${chunk + 1}/${pack.getChunkCount(maxChunkSize)} for pack ${pack.uuid} to player ${player.username}`
      );

      // Schedule the next chunk to be sent
      player.world
        .schedule(this.serenity.resources.properties.chunkDownloadTimeout) // The timeout for the next chunk
        .on(() => resolve(this.sendResourcePack(player, pack, chunk + 1)));
    });
  }
}

export { ResourcePackChunkRequestHandler };
