import { CommandRequestPacket } from "@serenityjs/protocol";
import { PlayerExecuteCommandSignal } from "@serenityjs/world";
import { CommandExecutionState } from "@serenityjs/command";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class CommandRequest extends SerenityHandler {
	public static packet = CommandRequestPacket.id;

	public static handle(
		packet: CommandRequestPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);
		if (!player) return;

		// Create a new PlayerExecuteCommandSignal instance.
		const signal = new PlayerExecuteCommandSignal(player, packet.command);
		const value = signal.emit();

		// If the signal was cancelled, return.
		if (value === false) return;

		// Get the world from the player
		const world = player.dimension.world;

		// Reassign the command to the signal's command.
		packet.command = signal.command;

		// Filter the command
		const name = packet.command.startsWith("/")
			? packet.command.slice(1)
			: packet.command;

		// Create a new CommandExecutionState instance
		const state = new CommandExecutionState(
			world.commands.getAll(),
			name,
			player
		);

		// Check if the player has the required permission to execute the command
		if ((state.command?.registry.permissionLevel ?? 4) > player.permission)
			return player.sendMessage(
				`§cYou do not have permission to execute this command.`
			);

		try {
			// Try to execute the command
			const result = state.execute();

			// Log the command to the console
			world.logger.info(
				`§8[§9${player.username}§8] Command:§r ${packet.command}`
			);

			// Send the result message to the player, if any.
			if (result.message) player.sendMessage(`§7${result.message}§r`);
		} catch (reason) {
			if (reason instanceof TypeError) {
				player.sendMessage(`§cType Error: ${(reason as Error).message}§r`);
			} else {
				player.sendMessage(`§cSyntax Error: ${(reason as Error).message}§r`);
			}
		}
	}
}

export { CommandRequest };
