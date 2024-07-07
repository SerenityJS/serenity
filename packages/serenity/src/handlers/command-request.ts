import {
	CommandPermissionLevel,
	CommandRequestPacket,
	PermissionLevel
} from "@serenityjs/protocol";
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

		// Get the command from the packet
		const state = new CommandExecutionState(
			player.dimension.world.commands,
			packet.command,
			player
		);

		// Convert the player permission level to a command permission level
		const permission =
			player.permission === PermissionLevel.Operator
				? CommandPermissionLevel.Operator
				: CommandPermissionLevel.Normal;

		// Check if the player has the required permission level
		if (
			state.command?.permission && // Check if the player has the required permission level
			permission < state.command.permission
		) {
			// Send a message to the player
			player.sendMessage(`§cYou do not have permission to use this command.§r`);

			// Return
			return;
		}

		// Try to execute the command
		try {
			// Execute the command
			const result = state.execute();
			if (!result) return;

			// Log the command to the console
			player.dimension.world.logger.info(
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
