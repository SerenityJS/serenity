import { DisconnectReason, AnimatePacket } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class AnimateHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = AnimatePacket.id;

	public static override handle(
		packet: AnimatePacket,
		session: NetworkSession
	): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player)
			return session.disconnect(
				"Failed to get player instance.",
				DisconnectReason.MissingClient
			);

		// Create a new animation event.
		const animate = new AnimatePacket();
		animate.runtimeEntityId = packet.runtimeEntityId;
		animate.id = packet.id;
		animate.boatRowingTime = packet.boatRowingTime;

		// Broadcast the animation event to all players in the dimension.
		player.dimension.broadcast(animate);
	}
}

export { AnimateHandler };
