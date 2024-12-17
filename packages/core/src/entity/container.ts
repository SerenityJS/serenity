import {
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

  public setItem(slot: number, itemStack: ItemStack): void {
    // Call the original setItem method
    super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.entity.world;
    itemStack.initialize();

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) this.update(this.entity);
  }

  public clearSlot(slot: number): void {
    // Call the original clearSlot method
    super.clearSlot(slot);

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
    packet.position = this.entity.position;
    packet.uniqueId = this.entity.uniqueId;

    // Send the packet to the player
    player.send(packet);

    // Update the container
    this.update();
  }
}

export { EntityContainer };
