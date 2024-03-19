import {
	DisconnectReason,
	InteractActions,
	InteractPacket,
	ContainerOpenPacket,
	WindowsTypes
} from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class InteractHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = InteractPacket.id;

	public static override handle(
		packet: InteractPacket,
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

		// Check if the packet is a open inventory packet.
		if (packet.action === InteractActions.OpenInventory) {
			// Create a new ContainerOpen packet.
			const container = new ContainerOpenPacket();

			// Get the player's inventory component.
			const inventory = player.getComponent("minecraft:inventory");

			// Assign the packet data.
			container.windowId = inventory.container.getWindowId();
			container.windowType = WindowsTypes.Inventory;
			container.position = player.position;
			container.targetRuntimeEntityId = player.runtimeId;

			// Send the packet.
			session.send(container);
		}
	}
}

export { InteractHandler };
