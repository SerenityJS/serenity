import process from 'node:process';
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

	public static logic(cause: ShutdownCause, reason: string | null): void {
		// Construct the shutdown event.
		const event = new Shutdown(cause, reason);

		// Emit the shutdown event.
		// Await the event to ensure that no data was changed.
		const value = this.serenity.emit('Shutdown', event);

		// If the value is false, the event was cancelled.
		// But is the cause is an interupt, we still want to shutdown the server.
		if (!value && cause !== ShutdownCause.Interupt) return;

		// Check if the cause is not an interupt.
		if (cause !== ShutdownCause.Interupt) {
			// TODO: Send a disconnect packet to all players.
		}

		// Log the shutdown event.
		this.serenity.logger.info('Server is now shutting down...');

		// Exit the process.
		process.exit(cause);
	}
}

export { Shutdown };
