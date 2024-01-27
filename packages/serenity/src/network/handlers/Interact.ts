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

		if (packet.ActionId === InteractActions.OpenInventory) {
			const openPacket = new ContainerOpen();
			openPacket.WindowId = WindowsIds.Inventory;
			openPacket.WindowType = WindowsTypes.Inventory;
			openPacket.position = { x: 0, y: -66, z: 0 };
			openPacket.targetRuntimeId = player.runtimeEntityId;
			await session.send(openPacket);
			console.log('sent container open');
		}
	}
}

export { InteractHandler };
