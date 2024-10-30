import { DisconnectPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerLeaveSignal } from "../events";

class DisconnectHandler extends NetworkHandler {
  public static readonly packet = Packet.Disconnect;

  public handle(packet: DisconnectPacket, connection: Connection): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Create a PlayerLeaveSignal
    new PlayerLeaveSignal(
      player,
      packet.reason,
      packet.message.message ?? String()
    ).emit();

    // Despawn the player
    player.despawn();

    // Get the player's dimension
    const dimension = player.dimension;

    // Save the player's data
    dimension.world.provider.writePlayer(player.getDataEntry(), dimension);

    // Log the leave event to the console
    dimension.world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player left the server.`
    );
  }
}

export { DisconnectHandler };
