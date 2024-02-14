import { DisconnectReason, Text } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class TextHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = Text.ID;

	public static override async handle(packet: Text, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Send the message to the player.
		const text = new Text();
		text.type = packet.type;
		text.needsTranslation = packet.needsTranslation;
		text.source = packet.source;
		text.message = packet.message;
		text.parameters = packet.parameters;
		text.xuid = packet.xuid;
		text.platformChatId = packet.platformChatId;

		await player.getWorld().network.broadcast(text);
	}
}

export { TextHandler };
