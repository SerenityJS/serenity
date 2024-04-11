import { CommandRequestPacket } from "@serenityjs/protocol";

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

		const rawCommand = packet.rawCommand.slice(1);

		// Execute command
		void this.serenity.commands.dispatchCommand(player, rawCommand);
	}
}

export { CommandRequest };
