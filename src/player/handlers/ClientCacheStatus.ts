import type { ClientCacheStatus } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class ClientCacheStatusHandler extends PlayerHandler {
	public static override handle(packet: ClientCacheStatus, player: Player): void {
		// TODO: Implement this
		this.logger.debug('ClientCacheStatusHandler is not implemented!');
	}
}

export { ClientCacheStatusHandler };
