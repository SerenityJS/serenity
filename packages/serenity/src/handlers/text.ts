import { DisconnectReason, TextPacket } from "@serenityjs/protocol";
import { PlayerChatSignal } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class Text extends SerenityHandler {
	public static packet = TextPacket.id;

	public static handle(packet: TextPacket, session: NetworkSession): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);

		// Disconnect the player if they are null or undefined.
		if (!player)
			return session.disconnect(
				"Failed to get player instance.",
				DisconnectReason.MissingClient
			);

		// Create a new PlayerChatSignal instance.
		const signal = new PlayerChatSignal(player, packet.message);
		const value = signal.emit();

		// If the signal was cancelled, return.
		if (value === false) return;

		// Set the message to the signal's message.
		packet.message = signal.message;

		// Send the packet.
		player.dimension.world.broadcast(packet);
	}
}

export { Text };
