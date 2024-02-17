import type { Packet } from '@serenityjs/bedrock-protocol';
import { UseItemAction, InventoryTransaction, DisconnectReason, TransactionType } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class InventoryTransactionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = InventoryTransaction.ID;

	public static override async handle(packet: InventoryTransaction, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);
	}

	private static handleItemUse(packet: InventoryTransaction, session: NetworkSession): void {
		switch (packet.data.action as UseItemAction) {
			default:
				break;
			case UseItemAction.BreakBlock: {
				console.log('break block');
				break;
			}
		}
	}
}

export { InventoryTransactionHandler };
