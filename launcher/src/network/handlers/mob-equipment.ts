import { DisconnectReason, MobEquipmentPacket } from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class MobEquipmentHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = MobEquipmentPacket.id;

	public static override handle(
		packet: MobEquipmentPacket,
		session: NetworkSession
	): void {
		// Get the player from the session.
		const player = session.player;

		// If the player is not found, return.
		if (!player) return;

		// Get the players inventory component.
		const inventory = player.getComponent("minecraft:inventory");

		// Get the item from the packet.
		const item = inventory.container.getItem(packet.slot);

		// Check if the items are not the same.
		// If so, disconnect the player.
		if (item && item.type.networkId !== packet.item.networkId) {
			session.disconnect(
				"Inventory out of sync, mismatch item runtimeid.",
				DisconnectReason.BadPacket
			);
			return this.serenity.logger.warn(
				`Player ${player.username} has been disconnected due to inventory out of sync, mismatch item runtimeid.`
			);
		} else if (item && item.amount !== packet.item.count) {
			session.disconnect(
				"Inventory out of sync, mismatch item count.",
				DisconnectReason.BadPacket
			);
			return this.serenity.logger.warn(
				`Player ${player.username} has been disconnected due to inventory out of sync, mismatch item count.`
			);
		}

		// Update the players selected slot.
		// NOTE: We don't need to use the selectSlot method from the inventory component,
		// Since that method is only used to send the packet to the client.
		inventory.selectedSlot = packet.selectedSlot;

		// NOTE: This could be broken, same client recieved a broken packet error.
		// Create a new mob equipment packet.
		const equipment = new MobEquipmentPacket();
		equipment.runtimeEntityId = packet.runtimeEntityId;
		equipment.item = packet.item;
		equipment.slot = packet.slot;
		equipment.selectedSlot = packet.selectedSlot;
		equipment.windowId = packet.windowId;

		// Broadcast the mob equipment packet to the dimension of the player.
		player.dimension.broadcastExcept(player, equipment);
	}
}

export { MobEquipmentHandler };
