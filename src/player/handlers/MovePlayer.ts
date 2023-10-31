import { DisconectReason } from '@serenityjs/protocol';
import type { MovePlayer } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { Handler } from './Handler';

class MovePlayerHandler extends Handler {
	public static override handle(packet: MovePlayer, session: NetworkSession): void {
		if (packet.cause) {
			return this.logger.error('Not implemented yet: MovePlayer.cause case');
		}

		// At this point, the player should be logged in, and a Player instance should be available
		// So we need to get that player instance from our NetworkSession
		// So lets get the player. And we will check if the player is available
		const player = this.serenity.getPlayerFromNetworkSession(session);
		if (!player) {
			this.logger.error(`Failed to get player instance from session! (${session.session.guid})`);
			return session.disconnect('Failed to get player instance from session!', false, DisconectReason.MissingClient);
		}

		// Update the player position
		player.position = packet.position;
		player.rotation = { x: packet.pitch, z: packet.yaw };
		player.headYaw = packet.headYaw;
		player.onGround = packet.onGround;
	}
}

export { MovePlayerHandler };
