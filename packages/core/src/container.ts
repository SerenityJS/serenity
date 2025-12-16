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
import { EntityContainer, type Player } from "./entity";
import { ItemIdentifier } from "./enums";

/**
 * Represents a container.
 */
class Container {
  /**
   * The occupants of the container.
   */
  public readonly occupants = new Map<Player, number>();

  /**
   * The type of the container.
   */
  public readonly type: ContainerType;

  /**
   * The identifier override of the container.
   * If null, the container will assign a incremental identifier for each player.
   */
  public identifier: ContainerId | null = null;

  /**
   * The size of the container.
   */
  public get size(): number {
    return this.storage.length;
  }

  /**
   * The size of the container.
   */
  public set size(value: number) {
    // Validate the size
    if (value < 0) throw new Error("Container size cannot be negative.");

    // Keep the existing items
    const existingItems = this.storage.slice(0, value);

    // Create a new storage array with the new size
    this.storage = Array.from(
      { length: value },
      (_, i) => existingItems[i] || null
    );
  }

  /**
   * The storage of the container.
   */
  public storage: Array<ItemStack | null> = [];

  /**
   * The amount of empty slots in the container.
   */
  public get emptySlotsCount(): number {
    return this.storage.filter((item) => item === null).length;
  }

  /**
   * Whether the container is full.
   */
  public get isFull(): boolean {
    return this.emptySlotsCount === 0;
  }

  /**
   * Creates a new container.
   * @param identifier The type of the container.
   * @param size The size of the container.
   */
  public constructor(type: ContainerType, size: number) {
    // Assign the properties
    this.type = type;
    this.size = size;
    this.storage = Array.from({ length: size }, () => null);
  }

  /**
   * Checks if the container is an entity container.
   * @returns Whether the container is an entity container.
   */
  public isEntityContainer(): this is EntityContainer {
    return this instanceof EntityContainer;
  }

  /**
   * Gets an item from the container.
   * @param slot The slot to get the item from.
   * @returns The item in the slot.
   */
  public getItem(slot: number): ItemStack | null {
    // Modulo the slot to avoid out of bounds errors.
    slot = slot % this.size;

    // Return the item in the slot
    return this.storage[slot] ?? null;
  }

  /**
   * Sets an item in the container.
   * @param slot The slot to set the item in.
   * @param item The item to set.
   */
  public setItem(slot: number, item: ItemStack): void {
    // Modulo the slot to avoid out of bounds errors.
    slot = slot % this.size;

    // Set the item in the slot
    this.storage[slot] = item;

    // Check if the item amount is 0
    // If so, set the slot to null as there is no item
    if (item.getStackSize() === 0 || item.identifier == ItemIdentifier.Air)
      this.clearSlot(slot);

    // Set the container of the item
    item.container = this;

    // Update the container for all occupants
    this.updateSlot(slot);
  }

  /**
   * Adds an item stack to the container.
   * @param item The item stack to add.
   * @returns Whether the item was successfully added into the container.
   */
  public addItem(item: ItemStack): boolean {
    // Find a slot that has the same item type and isn't full (x64)
    // If there is no slot, find the next empty slot.
    const slot = this.storage.findIndex((slot) => {
      // Check if the slot is null.
      if (!slot) return false;

      // Check if the item can be stacked.
      if (slot.getStackSize() >= item.maxStackSize) return false;

      // Check if the item is equal to the slot.
      return item.equals(slot);
    });

    // Check if the item is maxed.
    const maxed = item.getStackSize() >= item.maxStackSize;

    // Check if exists an available slot
    if (slot > -1 && !maxed && item.isStackable) {
      // Get the item if slot available
      const existingItem = this.storage[slot] as ItemStack;

      // Calculate the amount of items to add.
      const amount = Math.min(
        item.maxStackSize - existingItem.getStackSize(),
        item.getStackSize()
      );

      // Add the amount to the existing item.
      existingItem.incrementStack(amount);

      // Subtract the amount from the item.
      item.decrementStack(amount);

      // Return true as the item was successfully added.
      return true;
    } else {
      // Find the next empty slot.
      const emptySlot = this.storage.indexOf(null);

      // Check if there is an empty slot, if not return false.
      if (emptySlot === -1) return false;

      // Check if the item is maxed.
      if (item.getStackSize() > item.maxStackSize) {
        // Create a full stack item for the empty slot
        const newItem = new ItemStack(item.type, {
          ...item,
          stackSize: item.maxStackSize
        });

        // Add the new Item and decrease it
        this.setItem(emptySlot, newItem);
        item.decrementStack(item.maxStackSize);

        // Because it is greater than 64 call the function to add the remaining items
        return this.addItem(item);
      }

      // Set the item in the empty slot.
      this.setItem(emptySlot, item);

      // Return true as the item was successfully added.
      return true;
    }
  }

  /**
   * Removes an item from the container.
   * @param slot The slot to remove the item from.
   * @param amount The amount of the item to remove.
   */
  public removeItem(slot: number, amount: number): ItemStack | null {
    // Modulo the slot to avoid out of bounds errors.
    slot = slot % this.size;

    // Get the item from the slot.
    const item = this.getItem(slot);
    if (!item) return null;

    // Calculate the amount of items to remove.
    const removed = Math.min(amount, item.getStackSize());

    // Subtract the amount from the item.
    item.decrementStack(removed);

    // Check if the item amount is 0.
    if (item.getStackSize() === 0) this.storage[slot] = null;

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
    // Modulo the slot to avoid out of bounds errors.
    slot = slot % this.size;

    // Get the item in the slot.
    const item = this.getItem(slot);
    if (item === null) return null;

    // Check if the amount is equal to the item stack size.
    if (amount == item.getStackSize()) {
      // Clear the slot.
      this.clearSlot(slot);

      // Return the item.
      return item;
    }

    // Calculate the amount of items to remove.
    const removed = Math.min(amount, item.getStackSize());
    item.decrementStack(removed);

    // Check if the item amount is 0.
    if (item.getStackSize() === 0) this.clearSlot(slot);

    // Create a new item with the removed amount.
    const newItem = new ItemStack(item.type, {
      ...item,
      stackSize: removed,
      storage: undefined
    });

    // Clone the dynamic properties of the item to the new item.
    for (const [key, value] of item.getStorage().getAllDynamicProperties())
      newItem.getStorage().setDynamicProperty(key, value);

    // Clone the traits of the item to the new item.
    for (const trait of item.getAllTraits())
      newItem.addTrait(trait.clone(newItem));

    // Update the slot for all occupants.
    this.updateSlot(slot);

    // Clone the NBT tags of the item.
    for (const tag of item.getStorage().getStackNbt().values()) {
      newItem.nbt.add(tag);
    }

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
    // Modulo the slots to avoid out of bounds errors.
    slot = slot % this.size;
    otherSlot = otherSlot % (otherContainer?.size ?? this.size);

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
    // Modulo the slot to avoid out of bounds errors.
    slot = slot % this.size;

    // Set the slot to null.
    this.storage[slot] = null;

    // Check if the entity is a player, if so, return.
    if (this.occupants.size === 0) return;
    this.updateSlot(slot);
  }

  /**
   * Updates a slot in the container for all the occupants.
   * @param slot The slot to be updated.
   */
  public updateSlot(slot: number): void {
    // Create a new InventorySlotPacket.
    const packet = new InventorySlotPacket();
    const itemStack = this.storage.at(slot);

    // Set properties of the packet.
    packet.slot = slot;
    packet.item = itemStack
      ? ItemStack.toNetworkStack(itemStack)
      : new NetworkItemStackDescriptor(0);
    packet.fullContainerName = new FullContainerName(0, 0);
    packet.storageItem = new NetworkItemStackDescriptor(0); // Bundles ?

    // Iterate over the occupants and send the packet.
    for (const [player, identifier] of this.occupants) {
      // Set the container id of the packet.
      packet.containerId = identifier;
      // Send the packet to the player.
      player.send(packet);
    }
  }

  /**
   * Clears all slots in the container.
   */
  public clear(): void {
    // Clear all slots in the container.
    this.storage = Array.from({ length: this.storage.length }, () => null);

    // Check if there's anyone viewing the container.
    if (this.occupants.size == 0) return;
    // Update the container contents
    this.update();
  }

  /**
   * Updates the contents of the container.
   */
  public update(): void {
    // Create a new InventoryContentPacket.
    const packet = new InventoryContentPacket();

    // Set the properties of the packet.
    packet.fullContainerName = new FullContainerName(0, 0);
    packet.storageItem = new NetworkItemStackDescriptor(0); // Bundles ?

    // Map the items in the storage to network item stack descriptors.
    packet.items = this.storage.map((item) => {
      // If the item is null, return a new NetworkItemStackDescriptor.
      // This will indicate that the slot is empty.
      if (!item) return new NetworkItemStackDescriptor(0);

      // Convert the item stack to a network item stack descriptor
      return ItemStack.toNetworkStack(item);
    });

    // Send the packet to the occupants.
    for (const [player, identifier] of this.occupants) {
      // Set the container id of the packet.
      packet.containerId = identifier;

      // Send the packet to the player.
      player.send(packet);
    }
  }

  /**
   * Shows the container to a player.
   * @param player The player to show the container to.
   * @returns The container identifier assigned to the player.
   */
  public show(player: Player): number {
    // Check if the player is already viewing a container.
    // If so, close the container.
    if (player.openedContainer) player.openedContainer.close(player);

    // Get a new container identifier for the player.
    const identifier = Container.getNextContainerId();

    // Add the player to the occupants.
    this.occupants.set(player, identifier);

    // Set the opened container of the player.
    player.openedContainer = this;

    // Iterate over the storage, and call the onContainerOpen method of the item.
    for (const item of this.storage) {
      // Check if the item is null.
      if (!item) continue;

      // Iterate over the traits of the item and call the onContainerOpen method.
      for (const trait of item.getAllTraits()) trait.onContainerOpen?.(player);
    }

    // Return the container identifier assigned to the player.
    return identifier;
  }

  /**
   * Close the container for a player.
   * @param player The player to close the container for.
   * @param serverInitiated Whether the close was initiated by the server.
   */
  public close(player: Player, serverInitiated = true): void {
    // Check if the player is not viewing the container.
    if (!this.occupants.has(player))
      throw new Error("Player is not viewing the container.");

    // Get the container identifier for the player.
    const identifier = this.occupants.get(player) as number;

    // Create a new ContainerClosePacket.
    const packet = new ContainerClosePacket();
    packet.identifier = identifier;
    packet.type = this.type;
    packet.serverInitiated = serverInitiated;

    // Send the packet to the player.
    player.send(packet);

    // Set the opened container of the player to null.
    player.openedContainer = null;

    // Remove the player from the occupants.
    this.occupants.delete(player);

    // Iterate over the storage, and call the onContainerClose method of the item.
    for (const item of this.storage) {
      // Check if the item is null.
      if (!item) continue;

      // Iterate over the traits of the item and call the onContainerClose method.
      for (const trait of item.getAllTraits()) trait.onContainerClose?.(player);
    }
  }

  /**
   * The next container identifier.
   */
  private static nextContainerId = ContainerId.First;

  /**
   * Gets the next container identifier.
   * @returns The next container identifier.
   */
  public static getNextContainerId(): ContainerId {
    // Increment the current container id
    let id = Container.nextContainerId++;

    // Wrap around if exceeds the last container id
    if (id > ContainerId.Last) {
      // Assign the next container id to the first container id
      Container.nextContainerId = ContainerId.First;

      // Increment the id to return
      id = Container.nextContainerId;
    }

    // Return the id
    return id;
  }
}

export { Container };
