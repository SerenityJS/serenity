import { DisconnectReason, RespawnPacket } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class Respawn extends SerenityHandler {
	public static readonly packet = RespawnPacket.id;

	public static handle(_packet: RespawnPacket, session: NetworkSession): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Respawn the player
		player.respawn();
	}
}

export { Respawn };
