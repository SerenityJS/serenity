import { UseItemAction, InventoryTransaction, DisconnectReason, TransactionType } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class InventoryTransactionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = InventoryTransaction.ID;

	public static override async handle(packet: InventoryTransaction, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.getPlayerInstance();

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		switch (packet.type) {
			default:
				break;
			case TransactionType.ItemUse:
				return this.handleItemUse(packet, session);
		}
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
