import { BlockPickRequestPacket, Gamemode } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

export class BlockPick extends SerenityHandler {
	public static readonly packet = BlockPickRequestPacket.id;

	public static handle(
		packet: BlockPickRequestPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);
		if (!player) return;

		// Get the block from the packet
		const block = player.dimension.getBlock(packet);

		// Call the onPick methods on the block components
		for (const component of block.getComponents()) component.onPick?.(player);

		// Check if the player is in creative mode
		if (player.gamemode === Gamemode.Creative) {
			// Get the players inventory component
			const inventory = player.getComponent("minecraft:inventory");

			// Get current hotbar slot selected
			const selectedSlot = inventory.selectedSlot;

			// Check if the block is not air
			if (!block.isAir()) {
				// Turn block into item stack
				const item = block.getItemStack(1);

				// Set item on selected slot
				inventory.container.setItem(selectedSlot, item);
			}
		}
	}
}
