import {
	ContainerSlotType,
	ItemStackRequest,
	DisconnectReason,
	ItemStackActionType,
	ItemStackResponse,
	ItemStackStatus
} from "@serenityjs/protocol";

import { Item, ItemType } from "../../world";

import { NetworkHandler } from "./network-handler";

import type {
	ItemStackRequests,
	ItemStackAction,
	Packet
} from "@serenityjs/protocol";
import type { Player } from "../../player/player";
import type { NetworkSession } from "../session";

class ItemStackRequestHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = ItemStackRequest.id;

	public static override handle(
		packet: ItemStackRequest,
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

		// Loop through the requests.
		for (const request of packet.requests) {
			// Loop through the actions.
			for (const action of request.actions) {
				// Switch the action type.
				switch (action.type) {
					default: {
						this.serenity.network.logger.debug(
							"ItemStackAction not implemented:",
							ItemStackActionType[action.type]
						);
						break;
					}

					case ItemStackActionType.CraftCreative:
					case ItemStackActionType.ResultsDeprecated: {
						break;
					}

					case ItemStackActionType.Take: {
						this.handleTakeAction(player, action, request);
						break;
					}
					case ItemStackActionType.Place: {
						this.handlePlaceAction(player, action, request);
						break;
					}
					case ItemStackActionType.Destroy: {
						this.handleDestroyAction(player, action);
						break;
					}
				}
			}
		}
	}

	protected static handleTakeAction(
		player: Player,
		action: ItemStackAction,
		request: ItemStackRequests
	): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		switch (destination.type) {
			default: {
				this.serenity.network.logger.debug(
					"ItemStackTakeAction$destination not implemented:",
					ContainerSlotType[destination.type]
				);
				break;
			}

			case ContainerSlotType.Cursor: {
				if (source.type === ContainerSlotType.CreativeOutput) {
					// Get the cursor component.
					const cursor = player.getComponent("minecraft:cursor");

					// Get the runtime ID of the item.
					const runtimeId = request.actions[0]!.runtimeId!;

					// Create a new item for the cursor.
					const cursorItem = new Item(
						ItemType.resolveByRuntimeId(runtimeId)!,
						action.count!
					);

					// Set the item to the cursor.
					cursor.container.setItem(0, cursorItem);

					break;
				}

				// Get the inventory component
				const inventory = player.getComponent("minecraft:inventory");

				// Get the item from the source.
				const item = inventory.container.getItem(source.slot);

				// If the item is null, then return an error.
				if (!item) {
					const response = new ItemStackResponse();
					response.responses = [
						{
							status: ItemStackStatus.Error,
							id: request.id
						}
					];

					return player.session.send(response);
				}

				// Get the cursor component.
				const cursor = player.getComponent("minecraft:cursor");

				// Get the item from the cursor.
				const cursorItem = cursor.container.getItem(0);

				// If the cursor item exists, then we will add the item to the cursor.
				if (cursorItem) {
					// Add the amount to the cursor item.
					cursorItem.amount += action.count!;

					// Remove the amount from the item.
					item.amount -= action.count!;

					// Check if the item amount is 0.
					if (item.amount === 0) {
						// Clear the item from the source.
						inventory.container.clearSlot(source.slot);
					}
				} else {
					// Construct a new item for the cursor.
					const cursorItem = new Item(item.type, action.count!);

					// Set the item to the cursor.
					cursor.container.setItem(0, cursorItem);

					// Remove the amount from the item.
					item.amount -= action.count!;

					// Check if the item amount is 0.
					if (item.amount === 0) {
						// Clear the item from the source.
						inventory.container.clearSlot(source.slot);
					}
				}
			}
		}
	}

	protected static handlePlaceAction(
		player: Player,
		action: ItemStackAction,
		request: ItemStackRequests
	): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		switch (source.type) {
			default: {
				this.serenity.network.logger.debug(
					"ItemStackPlaceAction$source not implemented:",
					ContainerSlotType[source.type]
				);
				break;
			}

			case ContainerSlotType.Cursor: {
				// Get the cursor component.
				const cursor = player.getComponent("minecraft:cursor");

				// Get the item from the cursor.
				const item = cursor.container.getItem(0);

				// If the item is null, then return an error.
				if (!item) {
					const response = new ItemStackResponse();
					response.responses = [
						{
							status: ItemStackStatus.Error,
							id: request.id
						}
					];

					return player.session.send(response);
				}

				// Get the inventory component
				const inventory = player.getComponent("minecraft:inventory");

				// Get the item from the destination.
				const destinationItem = inventory.container.getItem(destination.slot);

				// If the item already exists in the destination, then we will add the item to the destination.
				if (destinationItem) {
					// Add the amount to the destination item.
					destinationItem.amount += action.count!;

					// Remove the amount from the cursor item.
					item.amount -= action.count!;

					// Check if the cursor item amount is 0.
					if (item.amount === 0) {
						// Clear the cursor item.
						cursor.container.clearSlot(0);
					}
				} else {
					// Construct a new item for the destination.
					const newItem = new Item(item.type, action.count!);

					// Set the item to the destination.
					inventory.container.setItem(destination.slot, newItem);

					// Remove the amount from the cursor item.
					item.amount -= action.count!;

					// Check if the cursor item amount is 0.
					if (item.amount === 0) {
						// Clear the cursor item.
						cursor.container.clearSlot(0);
					}
				}

				break;
			}

			case ContainerSlotType.HotbarAndInventory:
			case ContainerSlotType.Inventory:
			case ContainerSlotType.Hotbar: {
				// Get the inventory component
				const inventory = player.getComponent("minecraft:inventory");

				// Get the item from the source.
				const item = inventory.container.getItem(source.slot)!;

				// Check if the destination is the cursor.
				if (destination.type === ContainerSlotType.Cursor) {
					// Get the cursor component.
					const cursor = player.getComponent("minecraft:cursor");

					// Get the cursor item.
					const cursorItem = cursor.container.getItem(0);

					// If the cursor item exists, then we will add the item to the cursor.
					if (cursorItem) {
						// Add the amount to the cursor item.
						cursorItem.amount += action.count!;

						// Remove the amount from the item.
						item.amount -= action.count!;

						// Check if the item amount is 0.
						if (item.amount === 0) {
							// Clear the item from the source.
							inventory.container.clearSlot(source.slot);
						}
					} else {
						// Construct a new item for the cursor.
						const cursorItem = new Item(item.type, action.count!);

						// Set the item to the cursor.
						cursor.container.setItem(0, cursorItem);

						// Remove the amount from the item.
						item.amount -= action.count!;

						// Check if the item amount is 0.
						if (item.amount === 0) {
							// Clear the item from the source.
							inventory.container.clearSlot(source.slot);
						}
					}
				} else {
					// Get the destination item.
					const destinationItem = inventory.container.getItem(destination.slot);

					// If the item already exists in the destination, then we will add the item to the destination.
					if (destinationItem) {
						// Add the amount to the destination item.
						destinationItem.amount += action.count!;

						// Remove the amount from the source item.
						item.amount -= action.count!;

						// Check if the source item amount is 0.
						if (item.amount === 0) {
							// Clear the source item.
							inventory.container.clearSlot(source.slot);
						}
					} else {
						// Construct a new item for the destination.
						const newItem = new Item(item.type, action.count!);

						// Set the item to the destination.
						inventory.container.setItem(destination.slot, newItem);

						// Remove the amount from the source item.
						item.amount -= action.count!;

						// Check if the source item amount is 0.
						if (item.amount === 0) {
							// Clear the source item.
							inventory.container.clearSlot(source.slot);
						}
					}
				}

				// Send the response.

				break;
			}

			case ContainerSlotType.CreativeOutput: {
				// Get the inventory component
				const inventory = player.getComponent("minecraft:inventory");

				// Get the item from the source.
				const runtimeId = request.actions[0]!.runtimeId!;

				// Create a new item for the destination.
				const newItem = new Item(
					ItemType.resolveByRuntimeId(runtimeId)!,
					action.count!
				);

				// Set the item to the destination.
				inventory.container.setItem(destination.slot, newItem);

				break;
			}
		}
	}

	protected static handleDestroyAction(
		player: Player,
		action: ItemStackAction
	): void {
		// Get the source.
		const source = action.source!;

		// Check if the source is the cursor.
		if (source.type === ContainerSlotType.Cursor) {
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
}

export { ItemStackRequestHandler };
