import { BlockPickRequest, DisconnectReason } from "@serenityjs/protocol";

import { Item } from "../../world";

import { NetworkHandler } from "./network-handler";

import type { NetworkSession } from "../session";
import type { Packet } from "@serenityjs/protocol";

class BlockPickRequestHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = BlockPickRequest.id;

	public static override handle(
		packet: BlockPickRequest,
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

		// Get the players inventory component.
		const inventory = player.getComponent("minecraft:inventory");

		// Get the block from the dimension.
		const block = player.dimension.getBlock(packet.x, packet.y, packet.z);

		// Get the item type from the block.
		const itemType = player.dimension.world.items.resolveType(
			block.permutation.type.identifier
		);

		// Check if the item type is null.
		if (!itemType) return;

		// Create a new item instance.
		const item = new Item(itemType, 1);

		// Add the item to the players inventory.
		inventory.container.setItem(inventory.selectedSlot, item);
	}
}

export { BlockPickRequestHandler };
