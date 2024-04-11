import { DisconnectReason, MovePlayerPacket } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { Chunk } from "@serenityjs/world";
import type { NetworkSession } from "@serenityjs/network";

class MovePlayer extends SerenityHandler {
	public static packet = MovePlayerPacket.id;

	public static handle(
		packet: MovePlayerPacket,
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

		// Update the player's position
		player.position.x = packet.position.x;
		player.position.y = packet.position.y;
		player.position.z = packet.position.z;

		// Set the player's rotation
		player.rotation.pitch = packet.pitch;
		player.rotation.yaw = packet.yaw;
		player.rotation.headYaw = packet.headYaw;

		// Send the move player packet to all the players in the dimension.
		player.dimension.broadcastExcept(player, packet);

		// Calculate the new chunk view for the player.
		const px = player.position.x >> 4;
		const pz = player.position.z >> 4;
		const viewx = player.dimension.viewDistance >> 4;
		const viewz = player.dimension.viewDistance >> 4;

		// Prepare an array to store the chunks that need to be sent to the player.
		const chunks: Array<Chunk> = [];

		// Get the chunks to render.
		for (let x = -viewx + px; x <= viewx + px; x++) {
			for (let z = -viewz + pz; z <= viewz + pz; z++) {
				const chunk = player.dimension.getChunk(x, z);

				// Check if the chunk is already being rendered.
				if (player.chunks.has(chunk.getHash())) continue;

				// Add the chunk to the array.
				chunks.push(chunk);
			}
		}

		// Send the chunks to the player.
		player.sendChunk(...chunks);
	}
}

export { MovePlayer };
