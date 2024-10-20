import {
  RequestChunkRadiusPacket,
  Packet,
  ChunkRadiusUpdatePacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerChunkRenderingTrait } from "../entity";

class RequestChunkRadiusHandler extends NetworkHandler {
  public static readonly packet = Packet.RequestChunkRadius;

  public handle(
    packet: RequestChunkRadiusPacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Get the dimensions max view distance
    const maxViewDistance = player.dimension.viewDistance;

    // Get the requested view distance
    const viewDistance = packet.radius;

    // Get the player's chunk rendering trait
    const trait = player.getTrait(PlayerChunkRenderingTrait);

    // Set the view distance
    trait.viewDistance =
      viewDistance > maxViewDistance ? maxViewDistance : viewDistance;

    // Send the chunk radius updated packet
    const update = new ChunkRadiusUpdatePacket();
    update.radius = trait.viewDistance;

    // Send the update to the player
    player.sendImmediate(update);
  }
}

export { RequestChunkRadiusHandler };
