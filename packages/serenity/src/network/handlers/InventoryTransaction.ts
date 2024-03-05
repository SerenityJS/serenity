import type { Packet } from '@serenityjs/bedrock-protocol';
import { UseItemAction, InventoryTransaction, DisconnectReason, TransactionType } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class InventoryTransactionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = InventoryTransaction.ID;

	public static override handle(packet: InventoryTransaction, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Switch the transaction type.
		switch (packet.type) {
			default:
				this.serenity.logger.debug(`Unhandled TransactionType: ${TransactionType[packet.type as TransactionType]}`);
				break;
			case TransactionType.ItemUse: {
				this.handleItemUse(packet, session);
				break;
			}
		}
	}

	private static handleItemUse(packet: InventoryTransaction, session: NetworkSession): void {
		switch (packet.data.action as UseItemAction) {
			default:
				this.serenity.logger.debug(`Unhandled UseItemAction: ${UseItemAction[packet.data.action as UseItemAction]}`);
				break;

			case UseItemAction.BreakBlock: {
				// console.log('BreakBlock', packet);
				break;
			}

			case UseItemAction.ClickBlock: {
				// console.log('ClickBlock', packet);
				break;
			}
		}
	}
}

export { InventoryTransactionHandler };
