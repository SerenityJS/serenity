import {
	ContainerOpenPacket,
	DisconnectReason,
	InteractActions,
	InteractPacket,
	ContainerId,
	ContainerType
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class Interact extends SerenityHandler {
	public static packet = InteractPacket.id;

	public static handle(packet: InteractPacket, session: NetworkSession): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		if (packet.action === InteractActions.OpenInventory) {
			// Create a new ContainerOpen packet.
			const container = new ContainerOpenPacket();

			// Assign the packet data.
			container.identifier = ContainerId.Inventory;
			container.type = ContainerType.Inventory;
			container.position = player.position.floor();
			container.uniqueId = player.unique;

			// Send the packet.
			session.send(container);
		}
	}
}

export { Interact };
