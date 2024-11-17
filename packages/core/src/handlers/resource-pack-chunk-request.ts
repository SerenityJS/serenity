import {
  Packet,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket,
} from "@serenityjs/protocol";
import { NetworkHandler } from "../network";
import { Connection } from "@serenityjs/raknet";
import { ResourcePack } from "../resource-packs";

class ResourcePackChunkRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.ResourcePackChunkRequest;

  public handle(
    packet: ResourcePackChunkRequestPacket,
    connection: Connection,
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    const pack = this.serenity.resourcePacks.getPack(packet.packId);

    // This should never happen
    if (!pack) {
      // TODO: logging
      return;
    }

    const chunkPacket = new ResourcePackChunkDataPacket();
    chunkPacket.packId = packet.packId;
    chunkPacket.chunkId = packet.chunkId;
    chunkPacket.byteOffset = BigInt(
      packet.chunkId * ResourcePack.MAX_CHUNK_SIZE,
    );
    chunkPacket.chunkData = pack.getChunk(packet.chunkId);

    player.sendImmediate(chunkPacket);
  }
}

export { ResourcePackChunkRequestHandler };
