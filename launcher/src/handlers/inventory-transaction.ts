import {
	BlockFace,
	DisconnectReason,
	InventoryTransactionPacket,
	ItemUseInventoryTransactionType,
	type ItemUseInventoryTransaction
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { BlockPermutation } from "@serenityjs/block";
import type { Player } from "@serenityjs/world";
import type { NetworkSession } from "@serenityjs/network";

class InventoryTransaction extends SerenityHandler {
	public static packet = InventoryTransactionPacket.id;

	public static handle(
		packet: InventoryTransactionPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Check if the packet has a transaction
		if (!packet.transaction) return;

		if (packet.transaction.itemUse) {
			return this.handleItemUse(packet.transaction.itemUse, player);
		}
	}

	public static handleItemUse(
		packet: ItemUseInventoryTransaction,
		player: Player
	): void {
		// Check if the type is to place a block
		if (packet.type === ItemUseInventoryTransactionType.Place) {
			// Get the item thats being placed
			const inventory = player.getComponent("minecraft:inventory");
			const item = inventory.container.getItem(packet.slot);

			// Check if the item is valid and is a block
			if (!item) return;
			if (!item.type.block) return;

			// Get the block from the face
			const block = player.dimension
				.getBlock(
					packet.blockPosition.x,
					packet.blockPosition.y,
					packet.blockPosition.z
				)
				.face(packet.face);

			// Set the permutation of the block
			block.setPermutation(
				item.type.block.permutations[item.metadata] as BlockPermutation
			);

			// Set the direction of the block
			block.setDirection(
				player.getCardinalDirection(),
				packet.face !== BlockFace.Top
			);
		}
	}
}

export { InventoryTransaction };
