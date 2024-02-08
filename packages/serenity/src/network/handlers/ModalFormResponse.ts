import { DisconnectReason, ModalFormResponse } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class ModalFormResponseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = ModalFormResponse.ID;

	public static override async handle(packet: ModalFormResponse, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		console.log(packet);
	}
}

export { ModalFormResponseHandler };
