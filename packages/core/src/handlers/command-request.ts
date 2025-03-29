import { CommandRequestPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { CommandExecutionState } from "../commands";
import { PlayerCommandExecutorTrait } from "../entity";

class CommandRequestHandler extends NetworkHandler {
  public static readonly packet = Packet.CommandRequest;

  public async handle(
    packet: CommandRequestPacket,
    connection: Connection
  ): Promise<void> {
    // Get the player by the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the world from the player
    const world = player.dimension.world;

    // Filter the command
    const name = packet.command.startsWith("/")
      ? packet.command.slice(1)
      : packet.command;

    // Create a new CommandExecutionState instance
    const state = new CommandExecutionState(
      world.commandPalette.getAll(),
      name,
      player
    );

    // Call the entity onCommand trait methods
    let canceled = false;
    for (const trait of player.traits.values()) {
      // Check if the command was successful
      const success = trait.onCommand?.(state);

      // If the result is undefined, continue
      // As the trait does not implement the method
      if (success === undefined) continue;

      // If the result is false, cancel the command
      canceled = !success;
    }

    // If the command was canceled, return
    if (canceled || !state.command) return;

    // Get the executor trait from the player
    const executor = player.getTrait(PlayerCommandExecutorTrait);

    // Check if the player has permission to execute the command
    if (!executor || !executor.hasCommand(state.command))
      return player.sendMessage(
        `§cYou do not have permission to execute this command.`
      );

    try {
      // Try to execute the command
      const result = await state.execute();

      // Log the command to the console
      world.logger.info(
        `§8[§9${player.username}§8] Command:§r ${packet.command}`
      );

      // Send the result message to the player, if any.
      if (result.message) await player.sendMessage(`§7${result.message}§r`);
    } catch (reason) {
      if (reason instanceof TypeError) {
        await player.sendMessage(
          `§cType Error: ${(reason as Error).message}§r`
        );
      } else {
        await player.sendMessage(
          `§cSyntax Error: ${(reason as Error).message}§r`
        );
      }
    }
  }
}

export { CommandRequestHandler };
