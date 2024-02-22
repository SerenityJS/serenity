import type { ItemStackRequests, ItemStackAction, Packet } from '@serenityjs/bedrock-protocol';
import {
	ContainerSlotType,
	ItemStackRequest,
	DisconnectReason,
	ItemStackActionType,
	Gamemode,
	ItemStackResponse,
	ItemStackStatus,
} from '@serenityjs/bedrock-protocol';
import type { EntityInventoryComponent } from '../../entity/index.js';
import type { Player } from '../../player/Player.js';
import { Item, ItemType } from '../../world/index.js';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class ItemStackRequestHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = ItemStackRequest.ID;

	public static override async handle(packet: ItemStackRequest, session: NetworkSession): Promise<void> {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		// Loop through the requests.
		for (const request of packet.requests) {
			// Loop through the actions.
			for (const action of request.actions) {
				// Switch the action type.
				switch (action.type) {
					default:
						console.log('ItemStackAction not implemented:', ItemStackActionType[action.type]);
						break;

					case ItemStackActionType.Take:
						this.handleTakeAction(player, action, request);
						break;
					case ItemStackActionType.Place:
						this.handlePlaceAction(player, action, request);
						break;
				}
			}
		}
	}

	protected static handleTakeAction(player: Player, action: ItemStackAction, request: ItemStackRequests): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		switch (destination.type) {
			default:
				console.log('ItemStackTakeAction$destination not implemented:', ContainerSlotType[destination.type]);
				break;

			case ContainerSlotType.Cursor: {
				console.log(
					`source: ${ContainerSlotType[source.type]} ${source.slot}, destination: ${
						ContainerSlotType[destination.type]
					} ${destination.slot}, count: ${action.count}`,
				);
				// Get the inventory component
				const inventory = player.getComponent('minecraft:inventory');

				// Get the item from the source.
				const item = inventory.container.getItem(source.slot);

				// If the item is null, then return an error.
				if (item === null) {
					const response = new ItemStackResponse();
					response.responses = [
						{
							status: ItemStackStatus.Error,
							id: request.id,
						},
					];

					return player.session.send(response);
				}

				// Get the cursor component.
				const cursor = player.getComponent('minecraft:cursor');

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

		// switch (source.type) {
		// 	default:
		// 		console.log('ItemStackTakeAction not implemented:', ContainerSlotType[source.type]);
		// 		break;

		// 	case ContainerSlotType.Hotbar:
		// 	case ContainerSlotType.Inventory:
		// 	case ContainerSlotType.HotbarAndInventory: {
		// 		// Get the inventory component
		// 		const inventory = player.components.get('minecraft:inventory') as EntityInventoryComponent;
		// 		const container = inventory.container;

		// 		// Get the item from the source.
		// 		const item = container.getItem(source.slot)!;

		// 		// Remove the amount from the item.
		// 		item.amount -= action.count!;

		// 		// Create a new item for the cursor.
		// 		const cursor = new Item(item.type, action.count!); // Probably need to add a clone method to the item class.

		// 		// Set the cursor to the player's cursor.
		// 		this.cursors.set(player.uniqueId, cursor);
		// 		break;
		// 	}
		// }
	}

	protected static handlePlaceAction(player: Player, action: ItemStackAction, request: ItemStackRequests): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		switch (source.type) {
			default:
				console.log('ItemStackPlaceAction$source not implemented:', ContainerSlotType[source.type]);
				break;

			case ContainerSlotType.Cursor: {
				// Get the cursor component.
				const cursor = player.getComponent('minecraft:cursor');

				// Get the item from the cursor.
				const item = cursor.container.getItem(0);

				// If the item is null, then return an error.
				if (item === null) {
					const response = new ItemStackResponse();
					response.responses = [
						{
							status: ItemStackStatus.Error,
							id: request.id,
						},
					];

					return player.session.send(response);
				}

				// Get the inventory component
				const inventory = player.getComponent('minecraft:inventory');

				// Get the item from the destination.
				const destinationItem = inventory.container.getItem(destination.slot);

				// If the item already exists in the destination, then we will add the item to the destination.
				if (destinationItem) {
					// Add the amount to the destination item.
					destinationItem.amount += item.amount;

					// Remove the amount from the cursor item.
					item.amount -= item.amount;

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
			}
		}
	}
}

export { ItemStackRequestHandler };
