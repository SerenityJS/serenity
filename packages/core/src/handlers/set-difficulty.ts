import { SetDifficultyPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";

class SetDifficultyHander extends NetworkHandler {
  public static readonly packet = Packet.SetDifficulty;

  public handle(packet: SetDifficultyPacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return;

    // Set the difficulty for the world
    player.world.setDifficulty(packet.difficulty);
  }
}

export { SetDifficultyHander };
