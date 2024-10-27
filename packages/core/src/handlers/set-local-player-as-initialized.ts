import {
  Packet,
  SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
  public static readonly packet = Packet.SetLocalPlayerAsInitialized;

  public handle(
    _packet: SetLocalPlayerAsInitializedPacket,
    connection: Connection
  ): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Spawn the player
    player.spawn();
  }
}

export { SetLocalPlayerAsInitializedHandler };
