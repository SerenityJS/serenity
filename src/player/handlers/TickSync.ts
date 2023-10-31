import { DisconectReason } from '@serenityjs/protocol';
import type { TickSync } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { Handler } from './Handler';

class TickSyncHandler extends Handler {
	public static override handle(packet: TickSync, session: NetworkSession): void {
		// At this point, the player should be logged in, and a Player instance should be available
		// So we need to get that player instance from our NetworkSession
		// So lets get the player. And we will check if the player is available
		const player = this.serenity.getPlayerFromNetworkSession(session);
		if (!player) {
			this.logger.error(`Failed to get player instance from session! (${session.session.guid})`);
			return session.disconnect('Failed to get player instance from session!', false, DisconectReason.MissingClient);
		}

		// TODO: Handle tick sync
	}
}

export { TickSyncHandler };
