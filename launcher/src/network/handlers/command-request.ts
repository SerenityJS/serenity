import {
	CommandRequest as CommandRequestPacket,
	DisconnectReason
} from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class CommandRequest extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = CommandRequestPacket.id;

	public static override handle(
		packet: CommandRequestPacket,
		session: NetworkSession
	): void {
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player)
			return session.disconnect(
				"Failed to get player instance.",
				DisconnectReason.MissingClient
			);

		// CommandManager
		this.serenity.logger.debug(
			session.player?.username + " :" + packet.rawCommand
		);
	}
}

export { CommandRequest };
