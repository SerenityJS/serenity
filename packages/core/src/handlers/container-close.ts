import { ContainerClosePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerClosedContainerSignal } from "..";

class ContainerCloseHandler extends NetworkHandler {
  public static readonly packet = Packet.ContainerClose;

  public handle(_: ContainerClosePacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player has an opened container
    if (!player.openedContainer) return;

    // Create a new PlayerClosedContainerSignal
    new PlayerClosedContainerSignal(player, player.openedContainer).emit();

    // Close the container
    player.openedContainer.close(player);
  }
}

export { ContainerCloseHandler };
