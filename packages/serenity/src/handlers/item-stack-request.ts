import {
	ContainerName,
	DisconnectReason,
	type ItemStackAction,
	ItemStackActionType,
	ItemStackRequestPacket,
	type NetworkItemInstanceDescriptor
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

					case ItemStackActionType.Place:
					case ItemStackActionType.Take: {
						// Check if the source and destination exist.
						if (!action.source || !action.destination) break;

						// Get the source type and destination type.
						const sourceType = action.source.type;
						const destinationType = action.destination.type;
						const sourceSlot = action.source.slot;
						const destinationSlot = action.destination.slot;
						const amount = action.count ?? 1;

						// Check if the source type is a creative output.
						if (sourceType === ContainerName.CreativeOutput) break;

						// Fetch the source container from the player.
						const source = player.getContainer(sourceType);

						// Check if the source container exists.
						if (!source)
							throw new Error(
								`Invalid source type: ${ContainerName[sourceType]}`
							);

						// Fetch the destination container from the player.
						const destination = player.getContainer(destinationType);

						// Check if the destination container exists.
						if (!destination)
							throw new Error(
								`Invalid destination type: ${ContainerName[destinationType]}`
							);

						// Get the source item.
						const sourceItem = source.getItem(sourceSlot);

						// Check if the source item exists.
						if (!sourceItem) throw new Error("Invalid source item.");

						// Get the destination item.
						const destinationItem = destination.getItem(destinationSlot);

						if (amount <= sourceItem.amount) {
							const item = source.takeItem(sourceSlot, amount);

							if (!item) throw new Error("Invalid item.");

							if (destinationItem) {
								destinationItem.increment(item.amount);
							} else {
								destination.setItem(destinationSlot, item);

								// Clear the cursor, this appears to be a bug in the protocol.
								const cursor = player.getComponent("minecraft:cursor");
								if (!cursor) throw new Error("Invalid cursor.");
								if (cursor.container.getItem(0) === null)
									cursor.container.clearSlot(0);
							}
						} else throw new Error("Invalid count possible.");

						break;
					}

					case ItemStackActionType.Destroy: {
						this.handleDestroyAction(player, action);
						break;
					}

					case ItemStackActionType.CraftRecipe: {
						// Get the item instances action.
						const itemInstancesAction = request.actions[1] as ItemStackAction;
						const itemInstances = itemInstancesAction.resultItems;

						// Check if the item instances exist.
						if (!itemInstances) throw new Error("Invalid item instances.");

						// Convert the item instances to item stacks.
						const stacks = itemInstances.map((descriptor) =>
							// TODO: stackSize
							ItemStack.fromNetworkInstance(descriptor)
						);

						// Get the destination action, which is the last action in the request.
						const destinationAction = request.actions.at(-1) as ItemStackAction;
						if (!destinationAction.destination)
							throw new Error("Invalid destination.");

						// Get the destination type.
						const destinationType = destinationAction.destination.type;
						const destination = player.getContainer(destinationType);

						// Check if the destination exists.
						if (!destination)
							throw new Error(
								`Invalid destination type: ${ContainerName[destinationType]}`
							);

						// Add the item stacks to the destination.
						for (const stack of stacks) {
							if (!stack) continue;

							// Add the item stack to the destination.
							destination.addItem(stack);
						}
						break;
					}

					case ItemStackActionType.CraftCreative: {
						const resultsAction = request.actions[1] as ItemStackAction;

						if (!resultsAction.resultItems)
							throw new Error("Invalid results action.");

						const descriptor = resultsAction.resultItems[0];

						if (!descriptor) throw new Error("Invalid descriptor.");

						const action = request.actions[2] as ItemStackAction;

						if (!action) throw new Error("Invalid action.");

						this.handleCreativeSelectAction(player, action, descriptor);

						continue;
					}
				}
			}
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

	protected static handleCreativeSelectAction(
		player: Player,
		action: ItemStackAction,
		descriptor: NetworkItemInstanceDescriptor
	): void {
		// Get the destination.
		const destination = action.destination;

		// Check if the destination exists.
		if (!destination) return;

		// Get the destination container.
		const destinationContainer = player.getContainer(destination.type);

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
