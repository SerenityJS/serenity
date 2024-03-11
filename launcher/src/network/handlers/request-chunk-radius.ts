import {
	RequestChunkRadius,
	DisconnectReason,
	ChunkRadiusUpdate
} from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class RequestChunkRadiusHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = RequestChunkRadius.id;

	public static override handle(
		packet: RequestChunkRadius,
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

		// TODO: Set up proper handling for this packet.

		const radius = new ChunkRadiusUpdate();
		radius.radius = 64;

		session.send(radius);
	}
}

export { RequestChunkRadiusHandler };
