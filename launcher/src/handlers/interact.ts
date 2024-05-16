import {
	DisconnectReason,
	InteractActions,
	InteractPacket
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
			// Get the player's inventory component
			const inventory = player.getComponent("minecraft:inventory");

			// Show the container to the player
			inventory.container.show(player);
		}
	}
}

export { Interact };
