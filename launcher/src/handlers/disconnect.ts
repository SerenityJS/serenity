import { DisconnectPacket } from "@serenityjs/protocol";
import { NetworkSession } from "@serenityjs/network";

import { SerenityHandler } from "./serenity-handler";

class Disconnect extends SerenityHandler {
	public static packet = DisconnectPacket.id;

	public static handle(
		packet: DisconnectPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);
		if (!player) return;

		// Despawn the player
		player.despawn();

		// Remove the player from the players map
		this.serenity.players.delete(player.xuid);
	}
}

export { Disconnect };
