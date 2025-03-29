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

  public async setItem(slot: number, itemStack: ItemStack): Promise<void> {
    // Call the original setItem method
    await super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.block.world;
    await itemStack.initialize();
  }

  public async update(player?: Player): Promise<void> {
    // Call the original update method
    await super.update(player);

    // Call the onContainerUpdate method for the block traits
    for (const trait of this.block.traits.values()) {
      try {
        // Call the trait method
        await trait.onContainerUpdate?.(this);
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
    packet.position = this.block.position;
    packet.uniqueId =
      this.type === ContainerType.Container ? -1n : player.uniqueId;

    // Send the packet to the player
    await player.send(packet);

    // Update the container
    await this.update();
  }
}

export { BlockContainer };
