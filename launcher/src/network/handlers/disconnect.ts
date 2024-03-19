import { DisconnectPacket } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class DisconnectHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = DisconnectPacket.id;

	public static override handle(
		packet: DisconnectPacket,
		session: NetworkSession
	): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Return if the player is null or undefined.
		if (!player) return;

		// Despawn the player from the dimension.
		player.despawn();
	}
}

export { DisconnectHandler };
