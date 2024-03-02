import type { Packet } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, Animate } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class AnimateHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = Animate.ID;

	public static override handle(packet: Animate, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);
	}
}

export { AnimateHandler };
