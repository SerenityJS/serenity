import { SetPlayerGameTypePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class SetPlayerGameTypeHander extends NetworkHandler {
  public static readonly packet = Packet.SetPlayerGameType;

  public handle(packet: SetPlayerGameTypePacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return;

    // Set the gamemode for the player
    player.setGamemode(packet.gamemode);
  }
}

export { SetPlayerGameTypeHander };
