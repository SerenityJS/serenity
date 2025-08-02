import {
  Packet,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { ResourcePack, Resources } from "../resources";
import { Player } from "../entity";

class ResourcePackChunkRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ResourcePackChunkRequest;

  public handle(
    packet: ResourcePackChunkRequestPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Split the uuid and version
    const [uuid, _version] = packet.packId.split("_") as [string, string];

    // Add

    // console.log(packet);

    const pack = this.serenity.resources.packs.get(uuid);

    // This should never happen
    if (!pack) {
      // TODO: logging
      return;
    }

    // Check if we receive all the chunks for the pack
    if (packet.chunkId >= pack.getChunkCount() - 1) {
      // Schedule the next chunk to be sent
      player.world
        .schedule(this.serenity.resources.properties.chunkDownloadTimeout + 25) // Add a small delay to ensure the client has time to process the last chunk
        .on(() => this.sendResourcePack(pack, player));
    }
  }

  /**
   * Starts sending the resource pack to the player.
   * @param pack The resource pack to send.
   * @param player The player to send the pack to.
   * @param chunk The chunk index to start sending from.
   */
  private async sendResourcePack(
    pack: ResourcePack,
    player: Player,
    chunk = 0
  ): Promise<void> {
    // Check if we are done sending chunks
    if (chunk >= pack.getChunkCount()) return;

    // Create a new ResourcePackChunkDataPacket
    const chunkPacket = new ResourcePackChunkDataPacket();
    chunkPacket.packId = pack.uuid;
    chunkPacket.chunkId = chunk;
    chunkPacket.byteOffset = BigInt(chunk * Resources.MAX_CHUNK_SIZE);
    chunkPacket.chunkData = pack.getChunk(chunk);

    // Check if the player is still connected
    if (!this.serenity.players.has(player.connection)) return;

    // Send the packet to the player
    player.send(chunkPacket);

    // Log the sending of the chunk
    this.serenity.logger.debug(
      `Sending chunk ${chunk + 1}/${pack.getChunkCount()} for pack ${pack.uuid} to player ${player.username}`
    );

    // Schedule the next chunk to be sent
    player.world
      .schedule(this.serenity.resources.properties.chunkDownloadTimeout) // The timeout for the next chunk
      .on(() => this.sendResourcePack(pack, player, chunk + 1));
  }
}

export { ResourcePackChunkRequestHandler };
