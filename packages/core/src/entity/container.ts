import {
  BlockPosition,
  ContainerId,
  ContainerOpenPacket,
  ContainerType,
  FullContainerName,
  InventoryContentPacket,
  InventorySlotPacket,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";

import { Container } from "../container";
import { ItemStack } from "../item";
import { PlayerOpenedContainerSignal } from "../events";

import { Entity } from "./entity";
import { Player } from "./player";

class EntityContainer extends Container {
  /**
   * The entity that this container is attached to.
   */
  public readonly entity: Entity;

  public constructor(entity: Entity, type: ContainerType, size: number) {
    super(type, size);
    this.entity = entity;
  }

  /**
   * Check if the container is owned by the player.
   * @param player The player to check
   * @returns Returns true if the container is owned by the player, false otherwise
   */
  public isOwnedBy(player: Player): boolean {
    return this.entity === player;
  }

  public setItem(slot: number, itemStack: ItemStack): void {
    // Call the original setItem method
    super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.entity.world;

    // Iterate through the traits of the item type and add them to the item stack
    for (const [, trait] of itemStack.type.traits) itemStack.addTrait(trait);
  }

  public clearSlot(slot: number): void {
    // Call the original clearSlot method
    super.clearSlot(slot);
  }

  public clear(): void {
    // Call the original clear method
    super.clear();
  }

  public updateSlot(slot: number): void {
    // Call the original updateSlot method
    super.updateSlot(slot);
    if (this.entity.isPlayer()) {
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
      packet.containerId = this.identifier ?? ContainerId.None;
      // Send the packet to the player.
      this.entity.send(packet);
    }
  }

  public update(): void {
    // Call the original update method
    super.update();

    // Check if the entity is a player
    if (this.entity.isPlayer()) {
      // Create a new InventoryContentPacket.
      const packet = new InventoryContentPacket();

      // Set the properties of the packet.
      packet.containerId =
        this.type === ContainerType.Inventory
          ? ContainerId.Inventory
          : ContainerId.Ui;
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

      // Send the packet to the player.
      this.entity.send(packet);
    }

    // Call the onContainerUpdate method for the block traits
    for (const trait of this.entity.traits.values()) {
      try {
        // Call the trait method
        trait.onContainerUpdate?.(this);
      } catch (reason) {
        // Log the error to the console
        this.entity.world.logger.error(
          `Failed to trigger onContainerUpdate trait event for entity "${this.entity.type.identifier}:${this.entity.uniqueId}" in dimension "${this.entity.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the entity
        this.entity.traits.delete(trait.identifier);
      }
    }
  }

  public show(player: Player): number {
    // Create a new PlayerOpenedContainerSignal
    const signal = new PlayerOpenedContainerSignal(player, this);

    // Check if the signal was cancelled
    if (!signal.emit()) return ContainerId.None;

    // Call the original show method
    const identifier = super.show(player);

    // Create a new ContainerOpenPacket
    const packet = new ContainerOpenPacket();

    // Get if the container is owned by the player
    const owned = this.isOwnedBy(player);

    // Assign the properties
    packet.identifier = owned ? ContainerId.Inventory : identifier;
    packet.type = owned ? ContainerType.Inventory : this.type;
    packet.position = BlockPosition.fromVector3f(this.entity.position);
    packet.uniqueId = this.entity.uniqueId;

    // Send the packet to the player
    player.send(packet);

    // Update the container
    this.update();

    // Return the container identifier
    return identifier;
  }
}

export { EntityContainer };
