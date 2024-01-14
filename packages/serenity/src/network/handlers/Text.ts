import { DisconnectReason, Text } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class TextHandler extends NetworkHandler {
	public static override async handle(packet: Text, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Send the message to the player.
		const textPacket = new Text();
		textPacket.type = packet.type;
		textPacket.needsTranslation = packet.needsTranslation;
		textPacket.source = packet.source;
		textPacket.message = packet.message;
		textPacket.parameters = packet.parameters;
		textPacket.xuid = packet.xuid;
		textPacket.platformChatId = packet.platformChatId;

		await session.send(textPacket);
	}
}

export { TextHandler };
