import { DisconnectReason, TextPacket } from "@serenityjs/protocol";
import { NetworkSession } from "@serenityjs/network";

import { SerenityHandler } from "./serenity-handler";

class Text extends SerenityHandler {
	public static packet = TextPacket.id;

	public static handle(packet: TextPacket, session: NetworkSession): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);

		// Disconnect the player if they are null or undefined.
		if (!player)
			return session.disconnect(
				"Failed to get player instance.",
				DisconnectReason.MissingClient
			);

		// Send the message to the player.
		const text = new TextPacket();
		text.type = packet.type;
		text.needsTranslation = packet.needsTranslation;
		text.source = packet.source;
		text.message = packet.message;
		text.parameters = packet.parameters;
		text.xuid = packet.xuid;
		text.platformChatId = packet.platformChatId;

		// Send the packet.
		player.dimension.world.broadcast(text);
		// We shall log the message!
		this.serenity.logger.chat(text.source, text.message)

	}
}

export { Text };
