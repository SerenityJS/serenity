import {
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";

import { Container } from "../container";
import { ItemStack } from "../item";
import { Player } from "../entity";
import { PlayerOpenedContainerSignal } from "../events";

import { Block } from "./block";

class BlockContainer extends Container {
  /**
   * The block that this container is attached to.
   */
  public readonly block: Block;

  public constructor(
    block: Block,
    type: ContainerType,
    identifier: ContainerId,
    size: number
  ) {
    super(type, identifier, size);
    this.block = block;
  }

  public setItem(slot: number, itemStack: ItemStack): void {
    // Call the original setItem method
    super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.block.world;
    itemStack.initialize();
  }

  public update(player?: Player): void {
    // Call the original update method
    super.update(player);

    // Call the onContainerUpdate method for the block traits
    for (const trait of this.block.traits.values()) {
      try {
        // Call the trait method
        trait.onContainerUpdate?.(this);
      } catch (reason) {
        // Get the block position
        const { x, y, z } = this.block.position;

        // Log the error to the console
        this.block.world.logger.error(
          `Failed to trigger onContainerUpdate trait event for block "${this.block.type.identifier}:${x},${y},${z}" in dimension "${this.block.dimension.identifier}"`,
          reason
        );

        // Remove the trait from the block
        this.block.traits.delete(trait.identifier);
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
    packet.position = this.block.position;
    packet.uniqueId =
      this.type === ContainerType.Container ? -1n : player.uniqueId;

    // Send the packet to the player
    player.send(packet);

    // Update the container
    this.update();
  }
}

export { BlockContainer };
