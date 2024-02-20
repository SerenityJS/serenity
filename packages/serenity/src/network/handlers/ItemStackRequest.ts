import type { ItemStackRequests, ItemStackAction, Packet } from '@serenityjs/bedrock-protocol';
import {
	ItemStackRequest,
	DisconnectReason,
	ItemStackActionType,
	ContainerSlotType,
	Gamemode,
	ItemStackResponse,
	ItemStackStatus,
} from '@serenityjs/bedrock-protocol';
import type { Player } from '../../player/Player.js';
import { ItemType, Item } from '../../world/index.js';
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
				console.log(action);
				// Switch the action type.
				switch (action.type) {
					default:
						console.log('ItemStackAction not implemented:', ItemStackActionType[action.type]);
						break;

					case ItemStackActionType.Take:
						return this.handleTakeAction(player, action, request);
					case ItemStackActionType.Place:
						return this.handlePlaceAction(player, action, request);
				}
			}
		}
	}

	protected static handleTakeAction(player: Player, action: ItemStackAction, request: ItemStackRequests): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		// Switch the source type.
		switch (source.type) {
			default:
				console.log('TakeAction not implemented:', ContainerSlotType[source.type]);
				break;

			case ContainerSlotType.Hotbar: {
				// Get the item from the hotbar.
				const item = player.inventory.hotbar.get(source.slot);

				// Return if the item is null.
				if (!item) return;

				// Create a new ItemStackResponse packet.
				const packet = new ItemStackResponse();
				packet.responses = [
					{
						id: request.id,
						status: ItemStackStatus.Ok,
						containers: [
							{
								type: ContainerSlotType.Hotbar,
								slots: [
									{
										slot: source.slot,
										hotbarSlot: source.slot,
										amount: 0,
										runtimeId: 0,
										nametag: String(),
										durabilityCorrection: 0,
									},
								],
							},
							{
								type: ContainerSlotType.Cursor,
								slots: [
									{
										slot: destination.slot,
										hotbarSlot: destination.slot,
										amount: item.amount,
										runtimeId: item.type.runtimeId,
										nametag: item.nametag,
										durabilityCorrection: 0,
									},
								],
							},
						],
					},
				];

				// Send the player the packet.
				void player.session.send(packet);

				// Set the hotbar slot.
				player.inventory.hotbar.delete(source.slot);

				// Set the cursor to the item.
				player.inventory.cursor = item;
				break;
			}

			case ContainerSlotType.CreativeOutput: {
				// Check if the player is in creative mode.
				// If the player is not in creative mode kick them.
				if (player.gamemode !== Gamemode.Creative)
					return player.disconnect('Inventory transaction exploit.', DisconnectReason.KickedForExploit);

				// NOTE: A new Item should be created here.
				// We construct a new Item instance using a type and a count.
				// But we must first find the type of the item.
				// This action is sent with 2 other actions. The first action will contain the runtimeId of the item.
				const runtimeId = request.actions[0].runtimeId!;

				// Find the item type.
				// And return if the item type is null.
				const type = ItemType.resolveByRuntimeId(runtimeId);
				if (!type) break; // TODO: Send an error to the client.

				// Create the item.
				const item = new Item(player, type, action.count!);

				// Check if the destination is the cursor.
				if (destination.type !== ContainerSlotType.Cursor) return;

				// Create a new ItemStackResponse packet.
				const packet = new ItemStackResponse();

				// Assign the packet data.
				packet.responses = [
					{
						id: request.id,
						status: ItemStackStatus.Ok,
						containers: [
							{
								type: ContainerSlotType.Cursor,
								slots: [
									{
										slot: destination.slot,
										hotbarSlot: destination.slot,
										amount: item.amount,
										runtimeId: item.type.runtimeId,
										nametag: item.nametag,
										durabilityCorrection: 0,
									},
								],
							},
						],
					},
				];

				// Send the packet.
				void player.session.send(packet);

				// Set the item in the cursor.
				player.inventory.cursor = item;
				break;
			}
		}
	}

	protected static handlePlaceAction(player: Player, action: ItemStackAction, request: ItemStackRequests): void {
		// Get the source and destination.
		const source = action.source!;
		const destination = action.destination!;

		// Switch the destination type.
		switch (destination.type) {
			default:
				console.log('PlaceAction not implemented:', ContainerSlotType[destination.type]);
				break;

			case ContainerSlotType.Hotbar: {
				// Check if the source is the cursor.

				if (source.type === ContainerSlotType.Cursor) {
					// Get the item from the cursor.
					const item = player.inventory.cursor;

					// Return if the item is null.
					if (!item) return;

					// Create a new ItemStackResponse packet.
					const packet = new ItemStackResponse();
					packet.responses = [
						{
							id: request.id,
							status: ItemStackStatus.Ok,
							containers: [
								{
									type: ContainerSlotType.Hotbar,
									slots: [
										{
											slot: destination.slot,
											hotbarSlot: destination.slot,
											amount: item.amount,
											runtimeId: item.type.runtimeId,
											nametag: item.nametag,
											durabilityCorrection: 0, // TODO: Implement durability.
										},
									],
								},
								{
									type: ContainerSlotType.Cursor,
									slots: [
										{
											slot: 0,
											hotbarSlot: 0,
											amount: 0,
											runtimeId: 0,
											nametag: String(),
											durabilityCorrection: 0,
										},
									],
								},
							],
						},
					];

					// Send the player the packet.
					void player.session.send(packet);

					// Set the hotbar slot.
					player.inventory.hotbar.set(destination.slot, item);

					// Set the cursor to null.
					player.inventory.cursor = null;
				}
			}
		}
	}
}

export { ItemStackRequestHandler };
