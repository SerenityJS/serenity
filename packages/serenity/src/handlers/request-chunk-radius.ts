import {
	ChunkRadiusUpdatePacket,
	DisconnectReason,
	RequestChunkRadiusPacket
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class RequestChunkRadius extends SerenityHandler {
	public static packet = RequestChunkRadiusPacket.id;

	public static handle(
		packet: RequestChunkRadiusPacket,
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

		// Get the dimensions max view distance
		const maxViewDistance = player.dimension.viewDistance;

		// Get the requested view distance
		const viewDistance = packet.radius << 4;

		// Get the player's chunk rendering component
		const component = player.getComponent("minecraft:chunk_rendering");

		// Set the view distance
		component.viewDistance =
			viewDistance > maxViewDistance ? maxViewDistance : viewDistance;

		// Send the chunk radius updated packet
		const update = new ChunkRadiusUpdatePacket();
		update.radius = component.viewDistance >> 4;

		// Send the update to the player
		player.session.sendImmediate(update);
	}
}

export { RequestChunkRadius };
