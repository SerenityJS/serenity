import { DisconnectPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerLeaveSignal } from "../events";
import { PlayerListTrait } from "../entity";

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

    // Iterate through all players in the world and remove the player from their player lists
    for (const player of world.getPlayers()) {
      // Fetch the player list trait
      const trait = player.getTrait(PlayerListTrait);

      // Remove the disconnected player from the player list
      if (trait) trait.update(player, true);
    }

    // Write the player's data to the storage
    world.provider.writePlayer(player.uuid, player.getStorage());

    // Nullify the player's permissions
    player.permissions.player = null;

    // Log the leave event to the console
    player.world.logger.info(
      `§8[§9${player.username}§8] Event:§r Player left the server.`
    );
  }
}

export { DisconnectHandler };
