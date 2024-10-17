import {
  ContainerClosePacket,
  ContainerId,
  ContainerType,
  FullContainerName,
  InventoryContentPacket,
  InventorySlotPacket,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { ItemStack } from "./item";

import type { Player } from "./entity";

/**
 * Represents a container.
 */
abstract class Container {
  /**
   * The type of the container.
   */
  public readonly type: ContainerType;

  /**
   * The identifier of the container.
   */
  public readonly identifier: ContainerId;

  /**
   * The size of the container.
   */
  public readonly size: number;

  /**
   * The storage of the container.
   */
  public readonly storage: Array<ItemStack | null>;

  /**
   * The occupants of the container.
   */
  public readonly occupants = new Set<Player>();

  /**
   * The amount of empty slots in the container.
   */
  public emptySlotsCount: number;

  /**
   * Creates a new container.
   * @param identifier The type of the container.
   * @param size The size of the container.
   */
  public constructor(
    type: ContainerType,
    identifier: ContainerId,
    size: number
  ) {
    // Assign the properties
    this.type = type;
    this.identifier = identifier;
    this.size = size;
    this.storage = Array.from({ length: size }, () => null);
    this.emptySlotsCount = size;
  }

  /**
   * Calculates the amount of empty slots in the container.
   */
  protected calculateEmptySlotCount(): number {
    return this.storage.filter((item) => item === null).length;
  }

  /**
   * Gets an item from the container.
   * @param slot The slot to get the item from.
   * @returns The item in the slot.
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
    // Set the item in the slot
    this.storage[slot] = item;

    // Check if the item amount is 0
    // If so, set the slot to null as there is no item
    if (item.amount === 0) this.storage[slot] = null;

    // Update the empty slots count
    this.emptySlotsCount = this.calculateEmptySlotCount();

    // Update the container for all occupants
    this.update();
  }

  /**
   * Adds an item to the container.
   * @param item The item to add.
   * @returns The added item.
   */
  public addItem(item: ItemStack): void {
    // Find a slot that has the same item type and isn't full (x64)
    // If there is no slot, find the next empty slot.
    const slot = this.storage.findIndex((slot) => {
      // Check if the slot is null.
      if (!slot) return false;

      // Check if the item can be stacked.
      if (slot.amount >= item.maxAmount) return false;

      // Check if the item is equal to the slot.
      return true; // TODO: item.equals(slot);
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
        const newItem = new ItemStack(item.type.identifier, { ...item });

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
    // Get the item from the slot.
    const item = this.getItem(slot);
    if (!item) return null;

    // Calculate the amount of items to remove.
    const removed = Math.min(amount, item.amount);

    // Subtract the amount from the item.
    item.decrement(removed);

    // Check if the item amount is 0.
    if (item.amount === 0) this.storage[slot] = null;

    // Calculate the amount of empty slots in the container.
    this.emptySlotsCount = this.calculateEmptySlotCount();

    // Return the removed item.
    return item;
  }

  /**
   * Takes an item from the container.
   * @param slot The slot to take the item from.
   * @param amount The amount of the item to take.
   * @returns The taken item.
   */
  public takeItem(slot: number, amount: number): ItemStack | null {
    // Get the item in the slot.
    const item = this.getItem(slot);
    if (item === null) return null;

    // Calculate the amount of items to remove.
    const removed = Math.min(amount, item.amount);
    item.amount -= removed;

    // Check if the item amount is 0.
    if (item.amount === 0) {
      this.storage[slot] = null;
    }

    // Calculate the amount of empty slots in the container.
    this.calculateEmptySlotCount();

    // Create a new item with the removed amount.
    const newItem = new ItemStack(item.type, { ...item, amount: removed });

    // TODO: Clone the components and traits of the item.

    // // Clone the components of the item.
    // for (const component of item.components.values()) {
    //   component.clone(newItem);
    // }

    // // Clone the NBT tags of the item.
    // for (const tag of item.nbt.getTags()) {
    //   newItem.nbt.addTag(tag);
    // }

    // Return the new item.
    return newItem;
  }

  /**
   * Swaps items in the container.
   * @param slot The slot to swap the item from.
   * @param otherSlot The slot to swap the item to.
   * @param otherContainer The other container to swap the item to.
   */
  public swapItems(
    slot: number,
    otherSlot: number,
    otherContainer?: Container
  ): void {
    // Assign the target container
    const targetContainer = otherContainer ?? this;

    // Get the items in the slots
    const item = this.getItem(slot);
    const otherItem = targetContainer.getItem(otherSlot);

    // Clear the slots
    this.clearSlot(slot);
    targetContainer.clearSlot(otherSlot);

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
    if (this.occupants.size === 0) return;

    // Create a new InventorySlotPacket.
    const packet = new InventorySlotPacket();

    // Set properties of the packet.
    packet.containerId = this.identifier;
    packet.slot = slot;
    packet.item = new NetworkItemStackDescriptor(0);
    packet.fullContainerName = new FullContainerName(0, 0);
    packet.dynamicContainerSize = this.size;

    // Send the packet to the occupants.
    for (const player of this.occupants) player.send(packet);
  }

  /**
   * Clears all slots in the container.
   */
  public clear(): void {
    // Clear all slots in the container.
    for (let i = 0; i < this.size; i++) this.clearSlot(i);
  }

  /**
   * Updates the contents of the container.
   */
  public update(player?: Player): void {
    // Create a new InventoryContentPacket.
    const packet = new InventoryContentPacket();

    // Set the properties of the packet.
    packet.containerId = this.identifier;
    packet.fullContainerName = new FullContainerName(0, 0);
    packet.dynamicContainerSize = this.size;

    // Map the items in the storage to network item stack descriptors.
    packet.items = this.storage.map((item) => {
      // If the item is null, return a new NetworkItemStackDescriptor.
      // This will indicate that the slot is empty.
      if (!item) return new NetworkItemStackDescriptor(0);

      // Convert the item stack to a network item stack descriptor
      return ItemStack.toNetworkStack(item);
    });

    // Check if the player is provided.
    if (player) {
      // Send the packet to the player.
      player.send(packet);
    } else {
      // Send the packet to the occupants.
      for (const player of this.occupants) player.send(packet);
    }
  }

  /**
   * Shows the container to a player.
   * @param player The player to show the container to.
   */
  public show(player: Player): void {
    // Check if the player is already viewing a container.
    if (player.openedContainer)
      throw new Error("Player is already viewing a container.");

    // Add the player to the occupants.
    this.occupants.add(player);

    // Set the opened container of the player.
    player.openedContainer = this;
  }

  /**
   * Close the container for a player.
   * @param player The player to close the container for.
   */
  public close(player: Player): void {
    // Check if the player is not viewing the container.
    if (!this.occupants.has(player))
      throw new Error("Player is not viewing the container.");

    // Create a new ContainerClosePacket.
    const packet = new ContainerClosePacket();
    packet.identifier = this.identifier;
    packet.type = ContainerType.None;
    packet.serverInitiated = false;

    // Send the packet to the player.
    player.send(packet);

    // Set the opened container of the player to null.
    player.openedContainer = null;

    // Remove the player from the occupants.
    this.occupants.delete(player);
  }
}

export { Container };
