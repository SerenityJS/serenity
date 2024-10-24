import {
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";

import { Container } from "../container";
import { ItemStack } from "../item";

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
    if (!itemStack.world) itemStack.world = this.entity.getWorld();
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

  public show(player: Player): void {
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
