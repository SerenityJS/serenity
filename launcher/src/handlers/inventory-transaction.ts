import {
	BlockFace,
	DisconnectReason,
	InventoryTransactionPacket,
	ItemUseInventoryTransactionType,
	LevelSoundEvent,
	LevelSoundEventPacket,
	Vector3f,
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

			const { x, y, z } = packet.blockPosition;

			// Get the block from the face
			const block = player.dimension.getBlock(x, y, z).face(packet.face);

			// Set the permutation of the block
			block
				.setPermutation(
					item.type.block.permutations[item.metadata] as BlockPermutation,
					player
				)
				.setDirection(
					player.getCardinalDirection(),
					packet.face !== BlockFace.Top
				);

			// Create the sound packet
			const sound = new LevelSoundEventPacket();

			// Assign the sound data
			sound.event = LevelSoundEvent.Place;
			sound.position = new Vector3f(x, y, z);
			sound.data = block.permutation.network;
			sound.actorIdentifier = "";
			sound.isBabyMob = false;
			sound.isGlobal = true;

			// Broadcast the sound packet
			block.dimension.broadcast(sound);
		}
	}
}

export { InventoryTransaction };
