import { ContainerClosePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class ContainerCloseHandler extends NetworkHandler {
  public static readonly packet = Packet.ContainerClose;

  public handle(_: ContainerClosePacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player has an opened container
    if (!player.openedContainer) return;

    // Close the container
    player.openedContainer.close(player);
  }
}

export { ContainerCloseHandler };
