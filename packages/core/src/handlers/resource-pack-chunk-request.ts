import {
  Packet,
  ResourcePackChunkDataPacket,
  ResourcePackChunkRequestPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { Resources } from "../resources";

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

    const pack = this.serenity.resources.packs.get(uuid);

    // This should never happen
    if (!pack) {
      // TODO: logging
      return;
    }

    const chunkPacket = new ResourcePackChunkDataPacket();
    chunkPacket.packId = packet.packId;
    chunkPacket.chunkId = packet.chunkId;
    chunkPacket.byteOffset = BigInt(packet.chunkId * Resources.MAX_CHUNK_SIZE);
    chunkPacket.chunkData = pack.getChunk(packet.chunkId);

    player.sendImmediate(chunkPacket);
  }
}

export { ResourcePackChunkRequestHandler };
