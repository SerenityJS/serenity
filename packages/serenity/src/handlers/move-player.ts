import { DisconnectReason, MovePlayerPacket } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

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

		// Clear the player's motion
		if (packet.onGround && !player.onGround) {
			player.clearMotion();
		}

		// Set the player's on ground status
		player.onGround = packet.onGround;

		// Send the move player packet to all the players in the dimension.
		player.dimension.broadcastExcept(player, packet);
	}
}

export { MovePlayer };
