import {
	DisconnectReason,
	SetLocalPlayerAsInitializedPacket
} from "@serenityjs/protocol";
import { NetworkSession } from "@serenityjs/network";

import { SerenityHandler } from "./serenity-handler";

class SetLocalPlayerAsIntialized extends SerenityHandler {
	public static readonly packet = SetLocalPlayerAsInitializedPacket.id;

	public static handle(
		packet: SetLocalPlayerAsInitializedPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Spawn the current entities that are in the dimension
		for (const [, entity] of player.dimension.entities) {
			// Check if the entity is the player,
			// if so then skip the entity.
			if (entity === player) continue;

			// Spawn the entity for the player
			entity.spawn(player);
		}

		// Send the player the spawn chunks
		const chunks = player.dimension.getSpawnChunks();
		player.sendChunk(...chunks);
	}
}

export { SetLocalPlayerAsIntialized };
