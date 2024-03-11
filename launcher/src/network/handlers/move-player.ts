import { DisconnectReason, MovePlayer } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { Chunk } from "../../world";
import type { NetworkSession } from "../session";

class MovePlayerHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = MovePlayer.id;

	public static override handle(
		packet: MovePlayer,
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

		// Adjust the player's Y position.
		// For some reason, the client sends the player's Y position as 1.62 blocks higher than it should be.
		packet.position.y -= 1.62;

		// TODO: Add seperate logic for different move modes.
		// Set the player's position, rotation, head yaw, and on ground status.
		player.position.x = packet.position.x;
		player.position.y = packet.position.y;
		player.position.z = packet.position.z;

		// Set the player's rotation.
		player.rotation.pitch = packet.pitch;
		player.rotation.yaw = packet.yaw;
		player.rotation.headYaw = packet.headYaw;

		// Set the player's on ground status.
		player.onGround = packet.onGround;

		// Send the movement packet to all players.
		// Except for the player that sent the movement packet.
		// This is to prevent the player from seeing themselves move.
		for (const other of player.dimension.getPlayers()) {
			if (other === player) continue;

			const move = new MovePlayer();
			move.runtimeId = player.runtimeId;
			move.position = packet.position;
			move.pitch = player.rotation.pitch;
			move.yaw = player.rotation.yaw;
			move.headYaw = player.rotation.headYaw;
			move.mode = packet.mode;
			move.onGround = player.onGround;
			move.riddenRuntimeId = 0n;
			move.cause = packet.cause;
			move.tick = 0n;

			// Send the movement packet to the player.
			other.session.send(move);
		}

		// Calculate the new chunk view for the player.
		const px = player.position.x >> 4;
		const pz = player.position.z >> 4;

		const viewx = 128 >> 4;
		const viewz = 128 >> 4;

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

export { MovePlayerHandler };
