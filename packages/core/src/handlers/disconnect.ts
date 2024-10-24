import { DisconnectPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class DisconnectHandler extends NetworkHandler {
  public static readonly packet = Packet.Disconnect;

  public handle(_packet: DisconnectPacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Despawn the player
    player.despawn();

    // Get the player's dimension
    const dimension = player.dimension;

    // Save the player's data
    dimension.world.provider.writePlayer(player.getDataEntry(), dimension);
  }
}

export { DisconnectHandler };
