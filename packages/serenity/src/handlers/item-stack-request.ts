import {
	ContainerName,
	DisconnectReason,
	type ItemStackRequestAction,
	ItemStackRequestPacket
} from "@serenityjs/protocol";
import { ItemStack } from "@serenityjs/world";
import { CreativeItem } from "@serenityjs/item";

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
				// Check if the action is a take or place action.
				if (action.takeOrPlace) {
					// Get the request.
					const request = action.takeOrPlace;

					// Get the source type and destination type.
					const sourceType = request.source.container.identifier;
					const destinationType = request.destination.container.identifier;
					const sourceSlot = request.source.slot;
					const destinationSlot = request.destination.slot;
					const amount = request.amount ?? 1;

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
				}

				// Check if the action is a destroy or consume action.
				if (action.destroyOrConsume) {
					// Get the request.
					const request = action.destroyOrConsume;

					// Get the source.
					const source = request.source;
					if (!source) continue;

					// Check if the source is the cursor.
					if (source.container.identifier === ContainerName.Cursor) {
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

				if (action.craftRecipe) {
					// Get the item instance action.
					const itemInstanceAction = request
						.actions[1] as ItemStackRequestAction;

					// Check if the item instance action exists.
					if (!itemInstanceAction.resultsDeprecated)
						throw new Error("Invalid item instance action.");

					// Get the items being crafted.
					const descriptors = itemInstanceAction.resultsDeprecated.resultants;

					// Get the destination action.
					const destinationAction = request.actions.at(
						-1
					) as ItemStackRequestAction;

					// Check if the destination action exists.
					if (!destinationAction.takeOrPlace)
						throw new Error("Invalid destination action.");

					// Get the destination.
					const destination = player.getContainer(
						destinationAction.takeOrPlace.destination.container.identifier
					);

					// Check if the destination exists.
					if (!destination)
						throw new Error(
							`Invalid destination: ${destinationAction.takeOrPlace.destination.container.identifier}`
						);

					// Add the items to the destination.
					for (const descriptor of descriptors) {
						// Convert the descriptor to an item stack.
						const itemStack = ItemStack.fromNetworkInstance(descriptor);

						// Check if the item stack exists
						if (!itemStack)
							throw new Error(
								"Failed to convert network discriptor to item stack."
							);

						// Set the amount of the item stack.
						itemStack.setAmount(itemStack.amount * action.craftRecipe.amount);

						// Add the item stack to the destination.
						destination.addItem(itemStack);
					}
				}

				if (action.craftCreative) {
					// Get the destination request.
					const destinationAction = request
						.actions[2] as ItemStackRequestAction;

					// Check if the destination exists.
					if (!destinationAction.takeOrPlace)
						throw new Error("Invalid destination.");

					// Get the destination.
					const destination = destinationAction.takeOrPlace.destination;
					const amount = destinationAction.takeOrPlace.amount;

					// Get the container.
					const container = player.getContainer(
						destination.container.identifier
					);

					// Check if the container exists.
					if (!container)
						throw new Error(
							`Invalid container: ${destination.container.identifier}`
						);

					// Get the request.
					const craft = action.craftCreative;

					// Get the creative item.
					const creativeItem = CreativeItem.items.get(craft.creativeIndex);

					// Check if the creative item exists
					if (!creativeItem)
						throw new Error(
							`Received invalid creative item: ${craft.creativeIndex}`
						);

					// Create the item stack.
					const itemStack = ItemStack.create(creativeItem.type, amount);

					// Set the item stack in the container
					container.setItem(destination.slot, itemStack);
				}
			}
		}
	}
}

export { ItemStackRequest };
