import {
	DisconnectReason,
	InteractActions,
	Interact,
	ContainerOpen,
	WindowsIds,
	WindowsTypes,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class InteractHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = Interact.ID;

	public static override async handle(packet: Interact, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

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
			container.targetRuntimeEntityId = player.runtimeEntityId;

			// Send the packet.
			await session.send(container);
		}
	}
}

export { InteractHandler };
