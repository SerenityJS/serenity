import {
	type ContainerId,
	ContainerOpenPacket,
	type ContainerType,
	InventorySlotPacket,
	NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { ItemStack } from "../item";

import { Container } from "./container";

import type { Items } from "@serenityjs/item";
import type { Player } from "../player";
import type { Entity } from "../entity";

/**
 * Represents a container that is owned by an entity.
 */
class EntityContainer extends Container {
	/**
	 * The entity that owns the container.
	 */
	public readonly entity: Entity;

	/**
	 * Creates a new entity container.
	 * @param entity The entity that owns the container.
	 * @param size The size of the container.
	 */
	public constructor(
		entity: Entity,
		type: ContainerType,
		identifier: ContainerId,
		size: number
	) {
		super(type, identifier, size);
		this.entity = entity;
	}

	/**
	 * Sets an item in the container.
	 * @param slot The slot to set the item in.
	 * @param item The item to set.
	 */
	public getItem(slot: number): ItemStack | null {
		return this.storage[slot] ?? null;
	}

	/**
	 * Sets an item in the container.
	 * @param slot The slot to set the item in.
	 * @param item The item to set.
	 */
	public setItem(slot: number, item: ItemStack): void {
		// Set the item in the storage.
		this.storage[slot] = item;

		// Check if the item amount is 0.
		// If so, we set the slot to null.
		if (item.amount === 0) this.storage[slot] = null;

		// Calculate the amount of empty slots in the container.
		this.calculateEmptySlotCount();

		// Set the items container instance.
		item.container = this;

		// Check if the entity is a player, if so, return.
		if (!this.entity.isPlayer()) return;

		// Create a new InventorySlotPacket.
		const packet = new InventorySlotPacket();

		// Set properties of the packet.
		packet.containerId = this.identifier;
		packet.slot = slot;
		packet.item = ItemStack.toNetworkStack(item);

		// Send the packet to the player.
		this.entity.session.send(packet);
	}

	/**
	 * Adds an item to the container.
	 * @param item The item to add.
	 */
	public addItem(item: ItemStack): void {
		// Find a slot that has the same item type and isn't full (x64)
		// If there is no slot, find the next empty slot.
		const slot = this.storage.findIndex((slot) => {
			if (slot === null) return false;

			return slot.type === item.type && slot.amount < item.maxAmount;
		});

		// Check if the item is maxed.
		const maxed = item.amount >= item.maxAmount;

		// Check if exists an available slot
		if (slot > -1 && !maxed && item.stackable) {
			// Get the item if slot available
			const existingItem = this.storage[slot] as ItemStack;

			// Calculate the amount of items to add.
			const amount = Math.min(
				item.maxAmount - existingItem.amount,
				item.amount
			);

			// Add the amount to the existing item.
			existingItem.increment(amount);

			// Subtract the amount from the item.
			item.decrement(amount);
		} else {
			// Find the next empty slot.
			const emptySlot = this.storage.indexOf(null);

			// Check if there is an empty slot.
			if (emptySlot === -1) return;
			if (item.amount > item.maxAmount) {
				// Create a full stack item for the empty slot
				const newItem = new ItemStack(
					item.type.identifier,
					item.maxAmount,
					item.metadata
				);

				// Add the new Item and decrease it
				this.setItem(emptySlot, newItem);
				item.decrement(item.maxAmount);

				// Because it is greater than 64 call the function to add the remaining items
				return this.addItem(item);
			}
			// Set the item in the empty slot.
			this.setItem(emptySlot, item);
		}
	}

	/**
	 * Removes an item from the container.
	 * @param slot The slot to remove the item from.
	 * @param amount The amount of the item to remove.
	 */
	public removeItem(slot: number, amount: number): ItemStack | null {
		// Get the item in the slot.
		const item = this.getItem(slot);
		if (item === null) return null;

		// Calculate the amount of items to remove.
		const removed = Math.min(amount, item.amount);

		// Subtract the amount from the item.
		item.decrement(removed);

		// Check if the item amount is 0.
		if (item.amount === 0) {
			this.storage[slot] = null;
		}

		// Return the removed item.
		return item;
	}

	/**
	 * Takes an item from the container.
	 * @param slot The slot to take the item from.
	 * @param amount The amount of the item to take.
	 */
	public takeItem(slot: number, amount: number): ItemStack<keyof Items> | null {
		// Get the item in the slot.
		const item = this.getItem(slot);
		if (item === null) return null;

		// Calculate the amount of items to remove.
		const removed = Math.min(amount, item.amount);
		item.decrement(removed);

		// Check if the item amount is 0.
		if (item.amount === 0) {
			this.storage[slot] = null;
		}

		// Create a new item with the removed amount.
		const newItem = ItemStack.create(item.type, removed, item.metadata);

		// Clone the components of the item.
		for (const component of item.components.values()) {
			component.clone(newItem);
		}

		// Clone the NBT tags of the item.
		for (const tag of item.nbt.getTags()) {
			newItem.nbt.addTag(tag);
		}

		// Return the new item.
		return newItem;
	}

	/**
	 * Swaps items in the container.
	 * @param slot The slot to swap the item from.
	 * @param otherSlot The slot to swap the item to.
	 * @param otherCatainer The other container to swap the item with.
	 */
	public swapItems(
		slot: number,
		otherSlot: number,
		otherCatainer?: Container
	): void {
		// Assign the target container
		const targetContainer = otherCatainer ?? this;

		// Get the items in the slots
		const item = this.getItem(slot);
		const otherItem = targetContainer.getItem(otherSlot);

		// Clear the slots
		this.clearSlot(slot);
		targetContainer.clearSlot(otherSlot);

		// Set the items in the slots
		if (item) targetContainer.setItem(otherSlot, item);
		if (otherItem) this.setItem(slot, otherItem);
	}

	/**
	 * Clears a slot in the container.
	 * @param slot The slot to clear.
	 */
	public clearSlot(slot: number): void {
		// Set the slot to null.
		this.storage[slot] = null;

		// Calculate the amount of empty slots in the container.
		this.calculateEmptySlotCount();

		// Check if the entity is a player, if so, return.
		if (!this.entity.isPlayer()) return;

		// Create a new InventorySlotPacket.
		const packet = new InventorySlotPacket();

		// Set properties of the packet.
		packet.containerId = this.identifier;
		packet.slot = slot;
		packet.item = new NetworkItemStackDescriptor(0);

		// Send the packet to the player.
		this.entity.session.send(packet);
	}

	public show(player: Player): void {
		const packet = new ContainerOpenPacket();

		packet.identifier = this.identifier;
		packet.type = this.type;
		packet.position = this.entity.position;
		packet.uniqueId = this.entity.unique;

		player.openedContainer = this;

		player.session.send(packet);
	}
}

export { EntityContainer };
