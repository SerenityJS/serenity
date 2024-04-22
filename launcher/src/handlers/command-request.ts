import { CommandRequestPacket } from "@serenityjs/protocol";
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

		// TODO: Implement permission checks
		// The state will return the command entry, which contains the permission level

		// Try to execute the command
		try {
			// Execute the command
			const result = state.execute();
			if (!result) return;

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
