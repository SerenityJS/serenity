import { SetDefaultGamemodePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class SetDefaultGamemodeHander extends NetworkHandler {
  public static readonly packet = Packet.SetDefaultGamemode;

  public handle(
    packet: SetDefaultGamemodePacket,
    connection: Connection
  ): void {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return;

    // Set the default gamemode for the server
    player.world.setDefaultGamemode(packet.gamemode);
  }
}

export { SetDefaultGamemodeHander };
