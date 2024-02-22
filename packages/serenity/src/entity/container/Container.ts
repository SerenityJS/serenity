import { ContainerSlotType, InventorySlot, WindowsIds } from '@serenityjs/bedrock-protocol';
import { Player } from '../../player/Player.js';
import { Item, ItemType } from '../../world/index.js';
import type { Entity } from '../Entity.js';

/**
 * Represents a container that can hold items.
 */
class EntityContainer {
	/**
	 * The entity this container is attached to.
	 */
	protected readonly entity: Entity;

	/**
	 * The type of the container.
	 */
	public readonly type: ContainerSlotType;

	/**
	 * The size of the container.
	 */
	public readonly size: number;

	/**
	 * The storage of the container.
	 */
	public readonly storage: (Item | null)[];

	/**
	 * The amount of empty slots in the container.
	 */
	public emptySlotsCount: number;

	/**
	 * Initializes the container.
	 *
	 * @param entity - The entity this container is attached to.
	 * @param type - The type of the container slot.
	 * @param size - The size of the container.
	 */
	public constructor(entity: Entity, type: ContainerSlotType, size: number) {
		this.entity = entity;
		this.type = type;
		this.size = size;
		this.storage = Array.from({ length: size }, () => null);
		this.emptySlotsCount = size;
	}

	/**
	 * Calculates the amount of empty slots in the container.
	 */
	protected calculateEmptySlotsCount(): void {
		this.emptySlotsCount = this.storage.filter((item) => item === null).length;
	}

	/**
	 * Adds an item to the container. The item is placed in an existing slot with the same item type, or in the first available slot
	 *
	 * @param item
	 * @returns The item that was added to the container.
	 */
	public addItem(item: Item): Item {
		// Find the existing slots with the same item type.
		// Then will will check if the item is at the maximum stack size. (x64)
		const existingSlot = this.storage.findIndex((slot) => {
			if (slot === null) return false;

			return slot.type === item.type && slot.amount < 64;
		});

		// If there is no existing slot, we will loop through the storage.
		if (existingSlot === -1) {
			// Loop through the storage.
			for (let i = 0; i < this.storage.length; i++) {
				// Check if the slot is empty.
				if (this.storage[i] === null) {
					// Set the item to the slot.
					this.storage[i] = item;

					// Set the container of the item.
					// Update the network with the new item.
					item.container = this;
					EntityContainer.networkSetItem(this, item);

					// Break the loop.
					break;
				}
			}
		} else {
			// Get the existing item.
			const existingItem = this.storage[existingSlot]!;

			// Calculate the amount of items that can be added to the existing item.
			const amountToAdd = Math.min(64 - existingItem.amount, item.amount);

			// Add the amount to the existing item.
			existingItem.amount += amountToAdd;

			// NOTE: We don't need to update the network here, the amount setter will handle it.
			// Subtract the amount from the item.
			item.amount -= amountToAdd;

			// Update the storage.
			this.storage[existingSlot] = existingItem;

			// Remaining amount of items.
			const remainingAmount = item.amount;

			// Check if there are remaining items.
			if (remainingAmount > 0) {
				// Loop through the storage.
				for (let i = 0; i < this.storage.length; i++) {
					// Check if the slot is empty.
					if (this.storage[i] === null) {
						// Set the item to the slot.
						this.storage[i] = item;

						// Set the container of the item.
						// Update the network with the new item.
						item.container = this;
						EntityContainer.networkSetItem(this, item);

						// Break the loop.
						break;
					}
				}
			}
		}

		// Return the item.
		return item;
	}

	/**
	 * Gets the item from the given slot.
	 *
	 * @param slot - The slot to get the item from.
	 * @returns The item from the slot, or null if the slot is empty.
	 */
	public getItem(slot: number): Item | null {
		return this.storage[slot];
	}

	/**
	 * Sets the item to the given slot.
	 *
	 * @param slot - The slot to set the item to.
	 * @param item - The item to set to the slot.
	 */
	public setItem(slot: number, item: Item): void {
		// Set the item to the slot.
		this.storage[slot] = item;

		// Set the container of the item.
		item.container = this;

		// Update the network with the new item.
		EntityContainer.networkSetItem(this, item);
	}

	public clearSlot(slot: number): void {
		// Set the slot to null.
		this.storage[slot] = null;

		// Let the network know that the slot is empty.
		EntityContainer.networkClearSlot(this, slot);
	}

	/**
	 * Swaps the items in the given slots.
	 *
	 * @param slot - The first slot to swap.
	 * @param otherSlot - The second slot to swap.
	 */
	public swapItems(slot: number, otherSlot: number, otherContainer?: EntityContainer): void {
		// Assign the container.
		const container = otherContainer ?? this;

		// Get the items from the slots.
		const item = this.storage[slot];
		const otherItem = container.storage[otherSlot];

		// Clear the slots.
		this.clearSlot(slot);
		container.clearSlot(otherSlot);

		// Set the items to the slots.
		if (item) container.setItem(otherSlot, item);
		if (otherItem) this.setItem(slot, otherItem);
	}

	public takeItem(slot: number, count: number): Item | null {
		const item = this.storage[slot];
		if (item === null) return null;

		if (item.amount <= count) {
			this.clearSlot(slot);
			return item;
		}

		const newItem = new Item(item.type, count);

		item.amount -= count;
		this.setItem(slot, item);

		return newItem;
	}

	public getWindowId(): WindowsIds {
		switch (this.type) {
			case ContainerSlotType.Hotbar:
			case ContainerSlotType.Inventory:
			case ContainerSlotType.HotbarAndInventory:
				return WindowsIds.Inventory;

			case ContainerSlotType.Cursor:
				return WindowsIds.Ui;

			default:
				return WindowsIds.None;
		}
	}

	public static networkSetItem(container: EntityContainer, item: Item): void {
		// Check if the entity is a player.
		if (container.entity instanceof Player) {
			// Check if the item amount is 0.
			// If so, we will remove the item from the slot.
			if (item.amount === 0) {
				// Find the slot of the item.
				const slot = container.storage.indexOf(item);

				// Set the slot to null.
				container.storage[slot] = null;

				// Create a new InventorySlot packet.
				const packet = new InventorySlot();

				// Assign the packet data.
				packet.windowId = container.getWindowId();
				packet.slot = slot;
				packet.item = {
					networkId: 0,
				};

				// Send the packet.
				return void container.entity.session.send(packet);
			}

			// Get the item from the slot.
			// If the slot is empty, we will run the addItem method instead.
			const slot = container.storage.indexOf(item);
			if (slot === -1) return void container.addItem(item);

			// Create a new InventorySlot packet.
			const packet = new InventorySlot();

			// Assign the packet data.
			packet.windowId = container.getWindowId();
			packet.slot = container.storage.indexOf(item);
			packet.item = {
				networkId: item.type.networkId,
				count: item.amount,
				metadata: item.type.metadata,
				hasStackId: false,
				stackId: 0,
				blockRuntimeId: item.type.permutation?.getRuntimeId() ?? 0,
				extras: {
					canPlaceOn: [],
					canDestroy: [],
					hasNbt: true,
					nbt: {
						// // TODO: Add component system to Item
						// display: {
						// 	Name: item.nametag,
						// },
					},
				},
			};

			// Send the packet.
			void container.entity.session.send(packet);

			// Calculate the empty slots count.
			container.calculateEmptySlotsCount();
		}
	}

	public static networkClearSlot(container: EntityContainer, slot: number): void {
		if (container.entity instanceof Player) {
			const packet = new InventorySlot();

			packet.windowId = container.getWindowId();
			packet.slot = slot;
			packet.item = {
				networkId: 0,
			};

			void container.entity.session.send(packet);
		}
	}
}

export { EntityContainer };
