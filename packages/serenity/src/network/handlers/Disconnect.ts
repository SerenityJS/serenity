import type { Packet } from '@serenityjs/bedrock-protocol';
import { Disconnect } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class DisconnectHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = Disconnect.ID;

	public static override handle(packet: Disconnect, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Return if the player is null or undefined.
		if (!player) return;

		// Despawn the player from the dimension.
		player.dimension.despawnPlayer(player);
	}
}

export { DisconnectHandler };
