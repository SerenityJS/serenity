import { DisconnectReason, ScriptMessage, type MovePlayer } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class MovePlayerHandler extends NetworkHandler {
	public static override async handle(packet: MovePlayer, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Adjust the player's Y position.
		// For some reason, the client sends the player's Y position as 1.62 blocks higher than it should be.
		packet.position.y -= 1.62;

		// TODO: Add seperate logic for different move modes.
		// Set the player's position, rotation, head yaw, and on ground status.
		player.position = packet.position;
		player.rotation = { x: packet.pitch, z: packet.yaw };
		player.headYaw = packet.headYaw;
		player.onGround = packet.onGround;

		// TODO: Broadcast the player's movement to other players.
		// idk if this is 100% correct, but it works for now (i hope) cus i cant test it
		await Promise.all(
			[...this.serenity.players.values()].map(async (p) => {
				if (p !== player) {
					return p.broadcastMovement(packet.mode, player);
				}
			}),
		);
	}
}

export { MovePlayerHandler };
