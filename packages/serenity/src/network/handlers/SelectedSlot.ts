import type {
    SelectedSlot
} from '@serenityjs/bedrock-protocol';
import {
	DisconnectReason
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class SelectedSlotHandler extends NetworkHandler {
	public static override async handle(packet: SelectedSlot, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);
        player.sendMessage("Selected slot: " + packet.slot);
	}
}

export { SelectedSlotHandler};
