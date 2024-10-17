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

    // Save the player data
    player.save();
  }
}

export { DisconnectHandler };
