import type { Packet } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, MovePlayer } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class MovePlayerHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = MovePlayer.ID;

	public static override handle(packet: MovePlayer, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Adjust the player's Y position.
		// For some reason, the client sends the player's Y position as 1.62 blocks higher than it should be.
		// packet.position.y -= 1.62;

		// TODO: Add seperate logic for different move modes.
		// Set the player's position, rotation, head yaw, and on ground status.
		player.position.x = packet.position.x;
		player.position.y = packet.position.y;
		player.position.z = packet.position.z;

		// Set the player's rotation.
		player.rotation.x = packet.pitch;
		player.rotation.y = packet.yaw;
		player.rotation.z = packet.headYaw;

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
			move.pitch = player.rotation.x;
			move.yaw = player.rotation.y;
			move.headYaw = player.rotation.z;
			move.mode = packet.mode;
			move.onGround = player.onGround;
			move.riddenRuntimeId = 0n;
			move.cause = packet.cause;
			move.tick = 0n;

			// Send the movement packet to the player.
			other.session.send(move);
		}
	}
}

export { MovePlayerHandler };
