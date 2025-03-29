import { AnimatePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class AnimateHandler extends NetworkHandler {
  public static readonly packet = Packet.Animate;

  public async handle(
    packet: AnimatePacket,
    connection: Connection
  ): Promise<void> {
    // Get the player from the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Broadcast the animation to all players
    return player.dimension.broadcastExcept(player, packet);
  }
}

export { AnimateHandler };
