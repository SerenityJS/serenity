import {
	ContainerName,
	DisconnectReason,
	type ItemStackAction,
	ItemStackActionType,
	ItemStackRequestPacket,
	type NetworkItemInstanceDescriptor,
	type StackRequestSlotInfo
} from "@serenityjs/protocol";
import { ItemStack, type Player } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class ItemStackRequest extends SerenityHandler {
	public static readonly packet = ItemStackRequestPacket.id;

	public static handle(
		packet: ItemStackRequestPacket,
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

		// Loop through the requests.
		for (const request of packet.requests) {
			// Loop through the actions.
			for (const action of request.actions) {
				switch (action.type) {
					default: {
						this.serenity.network.logger.debug(
							"ItemStackAction not implemented:",
							ItemStackActionType[action.type]
						);
						break;
					}

					case ItemStackActionType.Take: {
						this.handleTakeAction(player, action);
						break;
					}

					case ItemStackActionType.Place: {
						this.handlePlaceAction(player, action);
						break;
					}

					case ItemStackActionType.Destroy: {
						this.handleDestroyAction(player, action);
						break;
					}

					case ItemStackActionType.CraftCreative: {
						const resultsAction = request.actions[1] as ItemStackAction;
						const descriptor = (
							resultsAction.resultItems as Array<NetworkItemInstanceDescriptor>
						)[0] as NetworkItemInstanceDescriptor;

						const action = request.actions[2] as ItemStackAction;

						this.handleCreativceSelectAction(player, action, descriptor);
						break;
					}
				}
			}
		}
	}

	protected static handleTakeAction(
		player: Player,
		action: ItemStackAction
	): void {
		// Get the source and destination.
		const source = action.source;
		const destination = action.destination;

		if (!source || !destination) return;

		const sourceContainer =
			source.type === ContainerName.Cursor
				? player.getComponent("minecraft:cursor").container
				: source.type === ContainerName.Inventory ||
					  source.type === ContainerName.Hotbar ||
					  source.type === ContainerName.HotbarAndInventory
					? player.getComponent("minecraft:inventory").container
					: player.openedContainer;

		const destinationContainer =
			destination.type === ContainerName.Cursor
				? player.getComponent("minecraft:cursor").container
				: destination.type === ContainerName.Inventory ||
					  destination.type === ContainerName.Hotbar ||
					  destination.type === ContainerName.HotbarAndInventory
					? player.getComponent("minecraft:inventory").container
					: player.openedContainer;

		if (!sourceContainer || !destinationContainer) return;

		const sourceItem = sourceContainer.getItem(source.slot);
		const destinationItem = destinationContainer.getItem(destination.slot);

		if (!sourceItem) return;

		if (destinationItem) {
			destinationItem.amount += action.count ?? 0;
			sourceItem.amount -= action.count ?? 0;

			if (sourceItem.amount === 0) sourceContainer.clearSlot(source.slot);
		} else {
			const item = sourceContainer.takeItem(source.slot, action.count ?? 1);

			if (!item) return;

			destinationContainer.setItem(destination.slot, item);

			if (sourceItem.amount === 0) sourceContainer.clearSlot(source.slot);
		}
	}

	protected static handlePlaceAction(
		player: Player,
		action: ItemStackAction
	): void {
		// Get the source and destination.
		const source = action.source as StackRequestSlotInfo;
		const destination = action.destination as StackRequestSlotInfo;

		if (!source || !destination) return;

		const sourceContainer =
			source.type === ContainerName.Cursor
				? player.getComponent("minecraft:cursor").container
				: source.type === ContainerName.Inventory ||
					  source.type === ContainerName.Hotbar ||
					  source.type === ContainerName.HotbarAndInventory
					? player.getComponent("minecraft:inventory").container
					: player.openedContainer;

		const destinationContainer =
			destination.type === ContainerName.Cursor
				? player.getComponent("minecraft:cursor").container
				: destination.type === ContainerName.Inventory ||
					  destination.type === ContainerName.Hotbar ||
					  destination.type === ContainerName.HotbarAndInventory
					? player.getComponent("minecraft:inventory").container
					: player.openedContainer;

		if (!sourceContainer || !destinationContainer) return;

		const sourceItem = sourceContainer.getItem(source.slot);
		const destinationItem = destinationContainer.getItem(destination.slot);

		if (!sourceItem) return;

		if (destinationItem) {
			destinationItem.amount += action.count ?? 0;
			sourceItem.amount -= action.count ?? 0;

			if (sourceItem.amount === 0) sourceContainer.clearSlot(source.slot);
		} else {
			const item = sourceContainer.takeItem(source.slot, action.count ?? 1);

			if (!item) return;

			destinationContainer.setItem(destination.slot, item);

			if (sourceItem.amount === 0) sourceContainer.clearSlot(source.slot);
		}
	}

	protected static handleDestroyAction(
		player: Player,
		action: ItemStackAction
	): void {
		// Get the source.
		const source = action.source;

		if (!source) return;

		// Check if the source is the cursor.
		if (source.type === ContainerName.Cursor) {
			// Get the cursor component.
			const cursor = player.getComponent("minecraft:cursor");

			// Clear the cursor.
			cursor.container.clearSlot(0);
		} else {
			// Get the inventory component
			const inventory = player.getComponent("minecraft:inventory");

			// Clear the source.
			inventory.container.clearSlot(source.slot);
		}
	}

	protected static handleCreativceSelectAction(
		player: Player,
		action: ItemStackAction,
		descriptor: NetworkItemInstanceDescriptor
	): void {
		// Get the destination.
		const destination = action.destination;

		// Check if the destination exists.
		if (!destination) return;

		// Get the destination container.
		const destinationContainer =
			destination.type === ContainerName.Cursor
				? player.getComponent("minecraft:cursor").container
				: destination.type === ContainerName.Inventory ||
					  destination.type === ContainerName.Hotbar ||
					  destination.type === ContainerName.HotbarAndInventory
					? player.getComponent("minecraft:inventory").container
					: player.openedContainer;

		// Check if the destination container exists.
		if (!destinationContainer) return;

		// Get the destination item.
		const destinationItem = destinationContainer.getItem(destination.slot);

		// Check if the destination item exists.
		if (destinationItem) {
			// Add the count to the destination item.
			destinationItem.amount += action.count ?? 0;
		} else {
			// Create the item stack from the descriptor.
			const item = ItemStack.fromNetworkInstance(descriptor);

			// Check if the item exists.
			if (!item) return;

			// Set the amount of the item.
			item.amount = action.count ?? 1;

			// Set the item in the destination container.
			destinationContainer.setItem(destination.slot, item);
		}
	}
}

export { ItemStackRequest };
