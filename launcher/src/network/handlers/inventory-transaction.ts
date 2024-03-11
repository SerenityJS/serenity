import { InventoryTransaction, DisconnectReason } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class InventoryTransactionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = InventoryTransaction.id;

	public static override handle(
		packet: InventoryTransaction,
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

		// Switch the transaction type.
	}
}

export { InventoryTransactionHandler };
