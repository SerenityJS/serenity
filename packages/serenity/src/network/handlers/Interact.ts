import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	DisconnectReason,
	InteractActions,
	Interact,
	ContainerOpen,
	WindowsIds,
	WindowsTypes,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class InteractHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = Interact.ID;

	public static override handle(packet: Interact, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Check if the packet is a open inventory packet.
		if (packet.action === InteractActions.OpenInventory) {
			// Create a new ContainerOpen packet.
			const container = new ContainerOpen();

			// Assign the packet data.
			container.windowId = WindowsIds.Inventory;
			container.windowType = WindowsTypes.Inventory;
			container.position = { x: 0, y: 0, z: 0 }; // Default position.
			container.targetRuntimeEntityId = player.runtimeId;

			// Send the packet.
			session.send(container);
		}
	}
}

export { InteractHandler };
