import { DisconnectReason, ContainerClose } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class ContainerCloseHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = ContainerClose.ID;

	public static override async handle(packet: ContainerClose, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		const ContainerClosePacket = new ContainerClose();
		ContainerClosePacket.WindowId = packet.WindowId;
		ContainerClosePacket.ServerInitiated = packet.ServerInitiated;

		await session.send(ContainerClosePacket);
	}
}

export { ContainerCloseHandler };
