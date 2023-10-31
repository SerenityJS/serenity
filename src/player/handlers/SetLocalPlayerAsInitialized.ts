import type { SetLocalPlayerAsInitialized } from '@serenityjs/protocol';
import { AddPlayer, DisconectReason, PlayerList } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { Handler } from './Handler';

class SetLocalPlayerAsInitializedHandler extends Handler {
	public static override handle(packet: SetLocalPlayerAsInitialized, session: NetworkSession): void {
		// At this point, the player should be logged in, and a Player instance should be available
		// So we need to get that player instance from our NetworkSession
		// So lets get the player. And we will check if the player is available
		const player = this.serenity.getPlayerFromNetworkSession(session);
		if (!player) {
			this.logger.error(`Failed to get player instance from session! (${session.session.guid})`);
			return session.disconnect('Failed to get player instance from session!', false, DisconectReason.MissingClient);
		}

		// Checks if the runtimeIds match
		if (packet.runtimeId !== session.runtimeId) {
			this.logger.error(`Player "${player.username}" tried to initialized with invalid runtime id!`);
			return session.disconnect('Invalid runtime id!', false, DisconectReason.MissingClient);
		}

		// Send the player the PlayerList packet
		const players = [...player.world.players.values()].filter((p) => p !== player);
		player.addPlayerToList(...players);
		// player.spawnPlayer(...players);
	}
}

export { SetLocalPlayerAsInitializedHandler };
