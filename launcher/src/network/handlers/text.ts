import { DisconnectReason, TextPacket } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class TextHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = TextPacket.id;

	public static override handle(
		packet: TextPacket,
		session: NetworkSession
	): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

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
		player.dimension.world.network.broadcast(text);
	}
}

export { TextHandler };
