import { DisconnectReason, MovePlayer } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class MovePlayerHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = MovePlayer.ID;

	public static override async handle(packet: MovePlayer, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Adjust the player's Y position.
		// For some reason, the client sends the player's Y position as 1.62 blocks higher than it should be.
		// packet.position.y -= 1.62;

		// TODO: Add seperate logic for different move modes.
		// Set the player's position, rotation, head yaw, and on ground status.
		player.position = packet.position;
		player.rotation = { x: packet.pitch, y: packet.yaw };
		player.headYaw = packet.headYaw;
		player.onGround = packet.onGround;

		// Send the movement packet to all players.
		// Except for the player that sent the movement packet.
		// This is to prevent the player from seeing themselves move.
		for (const other of player.getDimension().getPlayers()) {
			if (other === player) continue;

			const move = new MovePlayer();
			move.runtimeId = player.runtimeEntityId;
			move.position = packet.position;
			move.pitch = player.rotation.x;
			move.yaw = player.rotation.y;
			move.headYaw = player.headYaw;
			move.mode = packet.mode;
			move.onGround = player.onGround;
			move.riddenRuntimeId = 0n;
			move.cause = packet.cause;
			move.tick = 0n;

			// Send the movement packet to the player.
			void other.session.send(move);
		}
	}
}

export { MovePlayerHandler };
