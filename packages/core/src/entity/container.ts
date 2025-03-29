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

  public async setItem(slot: number, itemStack: ItemStack): Promise<void> {
    // Call the original setItem method
    await super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.entity.world;
    await itemStack.initialize();

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) await this.update(this.entity);
  }

  public async clearSlot(slot: number): Promise<void> {
    // Call the original clearSlot method
    await super.clearSlot(slot);

    // Update the container if the entity is a player
    if (this.entity.isPlayer()) await this.update(this.entity);
  }

  public async update(player?: Player): Promise<void> {
    // Call the original update method
    await super.update(player);

    // Call the onContainerUpdate method for the block traits
    for (const trait of this.entity.traits.values()) {
      try {
        // Call the trait method
        await trait.onContainerUpdate?.(this);
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

  public async show(player: Player): Promise<void> {
    // Create a new PlayerOpenedContainerSignal
    const signal = new PlayerOpenedContainerSignal(player, this);

    // Check if the signal was cancelled
    if (!(await signal.emit())) return;

    // Call the original show method
    await super.show(player);

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

    await player.send(packet);

    // Update the container
    await this.update();
  }
}

export { EntityContainer };
