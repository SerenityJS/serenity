import {
  BlockPosition,
  ContainerId,
  ContainerOpenPacket,
  ContainerType
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

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) this.update(this.entity);
  }

  public clearSlot(slot: number): void {
    // Call the original clearSlot method
    super.clearSlot(slot);

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) this.update(this.entity);
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) this.update(this.entity);
  }

  public update(player?: Player): void {
    // Call the original update method
    super.update(player);

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

  public show(player: Player): void {
    // Create a new PlayerOpenedContainerSignal
    const signal = new PlayerOpenedContainerSignal(player, this);

    // Check if the signal was cancelled
    if (!signal.emit()) return;

    // Call the original show method
    super.show(player);

    // Create a new ContainerOpenPacket
    const packet = new ContainerOpenPacket();

    // Assign the properties
    packet.identifier = this.identifier;
    packet.type = this.type;
    packet.position = BlockPosition.fromVector3f(this.entity.position);
    packet.uniqueId = this.entity.uniqueId;

    // Check if the container is the player's inventory, and the player is not the owner
    if (this.identifier === ContainerId.Inventory && !this.isOwnedBy(player)) {
      // Set the container type to the player's inventory
      packet.type = ContainerType.Container;
      packet.identifier = ContainerId.None;
    }

    player.send(packet);

    // Update the container
    this.update();
  }
}

export { EntityContainer };
