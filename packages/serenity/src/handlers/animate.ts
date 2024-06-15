import { AnimatePacket, DisconnectReason } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class Animate extends SerenityHandler {
	public static readonly packet = AnimatePacket.id;

	public static handle(packet: AnimatePacket, session: NetworkSession): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Broadcast the animate packet to all players in the dimension.
		player.dimension.broadcast(packet);
	}
}

export { Animate };
