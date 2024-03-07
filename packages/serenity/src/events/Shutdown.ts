import process from 'node:process';
import { setTimeout } from 'node:timers';
import { DisconnectReason } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { AbstractEvent } from './AbstractEvent.js';

enum ShutdownCause {
	Interupt,
	Stop,
	Restart,
}

class Shutdown extends AbstractEvent {
	public static serenity: Serenity;

	public casuse: any;
	public reason: string | null;

	public constructor(cause: any, reason: string | null) {
		super();
		this.casuse = cause;
		this.reason = reason;
	}

	/**
	 * Initializes the shutdown event
	 */
	public static initialize(): void {
		// Hook the process emit method to the shutdown event.
		process.on('SIGINT', async () => this.logic(ShutdownCause.Interupt, null));
	}

	public static async logic(cause: ShutdownCause, reason: string | null): Promise<void> {
		// Construct the shutdown event.
		const event = new Shutdown(cause, reason);

		// Emit the shutdown event.
		// Await the event to ensure that no data was changed.
		const value = this.serenity.emit('Shutdown', event);

		// If the value is false, the event was cancelled.
		// But is the cause is an interupt, we still want to shutdown the server.
		if (!value && cause !== ShutdownCause.Interupt) return;

		// Send disconnect packet to all players.
		for (const [guid, session] of this.serenity.network.sessions) {
			const player = session.player;

			if (player) {
				player.disconnect(
					this.serenity.properties.values.server.shutdown.message ?? 'Server closed',
					DisconnectReason.Shutdown,
				);
			}
		}

		// Log the shutdown event.
		this.serenity.logger.info('Server is now shutting down...');
    
    for (const [id, plugin] of this.serenity.pluginManager.plugins) {
      await plugin.main?.onDisable?.();
    }

		// Exit the process.
		// TODO: make better
		// NOTE: the process.exit are called before the player disconnects
		setTimeout(() => process.exit(cause), 50);
	}
}

export { Shutdown };
