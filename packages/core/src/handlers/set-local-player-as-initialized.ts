import {
  Packet,
  SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerInitializedSignal } from "../events";
import { PlayerListTrait } from "../entity";

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
  public static readonly packet = Packet.SetLocalPlayerAsInitialized;

  public handle(
    packet: SetLocalPlayerAsInitializedPacket,
    connection: Connection
  ): void {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the runtime entity id is the same as the player's
    if (packet.runtimeEntityId !== player.runtimeId)
      return player.disconnect("Entity runtime id mismatch");

    // Create a new player initialized signal
    const signal = new PlayerInitializedSignal(player);

    // Emit the signal and check if it was emitted successfully
    if (!signal.emit()) return;

    // Spawn the player
    player.spawn({ initialSpawn: true });

    // Get the world from the player
    const world = player.world;

    // Iterate through all players in the world and remove the player from their player lists
    for (const player of world.getPlayers()) {
      // Fetch the player list trait
      const trait = player.getTrait(PlayerListTrait);

      // Add the initialized player to the player list
      if (trait) trait.update(player, false);
    }
  }
}

export { SetLocalPlayerAsInitializedHandler };
