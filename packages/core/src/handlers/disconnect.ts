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

    // Get the default world from the serenity instance
    const world = this.serenity.getWorld(); // Default world

    // Write the player's data to the storage
    world.provider.writePlayer(player.uuid, player.getStorage());

    // Save the worlds the player leaves empty, the player's world and the default world holding its data,
    // so the changes are written now rather than waiting for the next save
    for (const target of new Set([player.world, world])) {
      // Check if any other players are still in the world
      const players = target.getPlayers().filter((other) => other !== player);
      if (players.length > 0) continue;

      // Save the world via the provider
      target.provider
        .onSave()
        .catch((reason) => target.logger.error("Failed to save world", reason));
    }

    // Nullify the player's permissions
    player.permissions.player = null;

    // Log the leave event to the console
    player.world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player left the server.`
    );
  }
}

export { DisconnectHandler };
