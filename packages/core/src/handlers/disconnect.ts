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
    player.despawn({ disconnected: true, hasDied: false });

    // Save the player's data in their current world.
    player.world.provider.writePlayer(player.getLevelStorage());

    // Save the player's data in the default world.
    const defaultWorld = this.serenity.getWorld()
    defaultWorld.provider.writePlayer(player.getLevelStorage());

    // Nullify the player's permissions
    player.permissions.player = null;

    // Log the leave event to the console
    player.world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player left the server.`
    );
  }
}

export { DisconnectHandler };
