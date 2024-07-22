import {
	ComplexInventoryTransaction,
	DisconnectReason,
	type InventoryAction,
	Packet,
	type InventoryTransactionPacket
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";
import { type Entity, ItemStack, type Player } from "@serenityjs/world";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";

/**
 * This signal is dispatched when an entity is spawned for a player, this means that this event may be dispatched multiple times depending on the amount of players.
 */
class PlayerDroppedItemSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.InventoryTransaction;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.After;

	/**
	 * The player that is dropping the item.
	 */
	public readonly player: Player;

	/**
	 * The item entity that is being dropped.
	 */
	public readonly entity: Entity;

	/**
	 * The item that is being dropped.
	 */
	public readonly item: ItemStack;

	/**
	 * The slot of the item that is being dropped.
	 */
	public readonly slot: number;

	/**
	 * Creates a new player dropped item signal.
	 * @param player The player that is dropping the item.
	 * @param entity The item entity that is being dropped.
	 * @param item The item that is being dropped.
	 * @param slot The slot of the item that is being dropped.
	 */
	public constructor(
		player: Player,
		entity: Entity,
		item: ItemStack,
		slot: number
	) {
		super();
		this.player = player;
		this.entity = entity;
		this.item = item;
		this.slot = slot;
	}

	public static logic(
		data: NetworkPacketEvent<InventoryTransactionPacket>
	): void {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound === NetworkBound.Client) return;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		const transaction = packet.transaction;

		// Check if the packet has a transaction.
		if (transaction.actions.length === 0) return;

		// Check if the transaction is a normal transaction.
		if (transaction.type !== ComplexInventoryTransaction.NormalTransaction)
			return;
		if (transaction.actions.length > 2) return;

		// Get the action from the transaction.
		const action = transaction.actions[0] as InventoryAction;
		const { selectedSlot, container } = player.getComponent(
			"minecraft:inventory"
		);

		// Get the item entity from the action.
		const entity = player.dimension.getEntities().find((entity) => {
			if (!entity.hasComponent("minecraft:item")) return false;

			// Get the item stack and birth tick from the entity.
			const { itemStack, birthTick } = entity.getComponent("minecraft:item");

			// Check if the item stack and birth tick are not null.
			if (entity.dimension.world.currentTick - birthTick > 0n) return false;

			// Check if the item stack is not null.
			if (itemStack.type.network !== action.newItem.network) return false;

			return true;
		});

		if (!entity) throw new Error("Failed to find the item entity.");

		const { itemStack } = entity.getComponent("minecraft:item");

		// Create a new signal with the player, entity, item, and slot.
		const signal = new this(player, entity, itemStack, selectedSlot);

		// Dispatch the signal.
		const value = this.serenity.emit("PlayerDroppedItem", signal);

		// Check if the signal was cancelled.
		if (!value) {
			// Despawn the entity.
			entity.despawn();

			// Get the item from the player's inventory.
			const itemStack = container.getItem(selectedSlot);

			// Check if the item is not null.
			if (itemStack) {
				itemStack.increment(signal.item.amount);
			} else {
				const item = ItemStack.fromNetworkInstance(action.newItem);

				// Check if the item is null.
				if (!item)
					throw new Error("Failed to create itemStack from the action.");

				// Set the item to the player's inventory.
				container.setItem(selectedSlot, item);
			}
		}
	}
}

export { PlayerDroppedItemSignal };
