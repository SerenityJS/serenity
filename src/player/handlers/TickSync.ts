import type { TickSync } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class TickSyncHandler extends PlayerHandler {
	public static override handle(packet: TickSync, player: Player): void {
		// TODO: Handle tick sync
		this.logger.debug(`TickSyncHandler is not implemented! (tick: ${packet.requestTime})`);
	}
}

export { TickSyncHandler };
