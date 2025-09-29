import {
  CraftingDataPacket,
  Packet,
  SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CRAFTING_DATA } from "@serenityjs/data";

import { NetworkHandler } from "../network";
import { PlayerInitializedSignal } from "../events";

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
  public static readonly packet = Packet.SetLocalPlayerAsInitialized;

  // TODO: remove this when we have a recipe system
  public static readonly CraftingData = new CraftingDataPacket(
    CRAFTING_DATA
  ).deserialize();

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
  }
}

export { SetLocalPlayerAsInitializedHandler };
