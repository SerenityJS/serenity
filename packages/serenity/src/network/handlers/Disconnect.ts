import { Disconnect } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class DisconnectHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = Disconnect.ID;

	public static override async handle(packet: Disconnect, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Return if the player is null or undefined.
		if (!player) return;

		// TEMP: remove the player from the world.
		player.world.players.delete(player.uniqueId);
	}
}

export { DisconnectHandler };
