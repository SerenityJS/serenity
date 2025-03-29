import { Packet, TextPacket } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { PlayerChatSignal } from "../events";

class TextHandler extends NetworkHandler {
  public static readonly packet = Packet.Text;

  public async handle(
    packet: TextPacket,
    connection: Connection
  ): Promise<void> {
    // Get the player by the connection
    const player = this.serenity.players.get(connection);
    if (!player) return connection.disconnect();

    // Create a new PlayerChatSignal
    const signal = new PlayerChatSignal(player, packet.message);

    // If the signal was canceled, return
    if (!(await signal.emit())) return;

    // Set the message of the packet to the signal message
    // eslint-disable-next-line require-atomic-updates
    packet.message = signal.message;

    // Call the block onStartBreak trait methods
    let canceled = false;
    for (const trait of player.traits.values()) {
      // Check if the start break was successful
      const success = trait.onChat?.(packet.message);

      // If the result is undefined, continue
      // As the trait does not implement the method
      if (success === undefined) continue;

      // If the result is false, cancel the break
      canceled = !success;
    }

    // Broadcast the packet if it was not canceled
    if (!canceled) {
      // Broadcast the packet to the world
      await player.dimension.world.broadcast(packet);

      // Log the chat to the console
      player.dimension.world.logger.info(
        `§8[§9${player.username}§8] Chat:§r ${packet.message}`
      );
    }
  }
}

export { TextHandler };
