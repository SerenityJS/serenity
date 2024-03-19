import { DisconnectReason, ContainerClosePacket } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class ContainerCloseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = ContainerClosePacket.id;

	public static override handle(
		packet: ContainerClosePacket,
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

		// Create a new ContainerClose packet.
		const close = new ContainerClosePacket();

		// Assign the packet data.
		close.windowId = packet.windowId;
		close.serverInitiated = packet.serverInitiated;

		// Send the packet.
		session.send(close);
	}
}

export { ContainerCloseHandler };
