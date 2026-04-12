import {
  BlockPosition,
  type IPosition,
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";

import { Container } from "../container";
import { ItemStack } from "../item/stack";
import { Player } from "../entity/player";
import { PlayerOpenedContainerSignal } from "../events/player-opened-container";
import type { Block } from "./block";

class BlockContainer extends Container {
  /**
   * The block that this container is attached to.
   */
  public readonly block: Block;

  public constructor(block: Block, type: ContainerType, size: number) {
    super(type, size);
    this.block = block;
  }

  public setItem(slot: number, itemStack: ItemStack): void {
    // Call the original setItem method
    super.setItem(slot, itemStack);

    // Set the world in the item stack if it doesn't exist
    if (!itemStack.world) itemStack.world = this.block.world;

    // Iterate through the traits of the item type and add them to the item stack
    for (const [, trait] of itemStack.type.traits) itemStack.addTrait(trait);
  }

  public update(): void {
    // Call the original update method
    super.update();

    // Call the onContainerUpdate method for the block traits
    this.notifyTraits();
  }

  public updateSlot(slot: number): void {
    // Call the original updateSlot method
    super.updateSlot(slot);

    // Call the onContainerUpdate method for the block traits
    this.notifyTraits();
  }

  private notifyTraits(): void {
    // Call the onContainerUpdate method for the block traits
    for (const trait of this.block.getAllTraits()) {
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
        this.block.removeTrait(trait.identifier);
      }
    }
  }

  public show(player: Player, position: IPosition = this.block.position): number {
    // Create a new PlayerOpenedContainerSignal
    const signal = new PlayerOpenedContainerSignal(player, this);

    // Check if the signal was cancelled
    if (!signal.emit()) return ContainerId.None;

    // Call the original show method
    const identifier = super.show(player);

    // Create a new ContainerOpenPacket
    const packet = new ContainerOpenPacket();

    // Assign the properties
    packet.identifier = identifier;
    packet.type = this.type;
    packet.position = position instanceof BlockPosition
      ? position
      : new BlockPosition(position.x, position.y, position.z);
    // Vanilla/BDS uses -1 for block container windows, including hoppers.
    packet.uniqueId = -1n;

    // Send the packet to the player
    player.send(packet);

    // Update the container
    this.update();

    // Some block container UIs (such as furnaces) ignore the initial full
    // content snapshot until the window exists client-side. Re-send the slots
    // on the next tick once the container is definitely open. dunno why its done like this here but i aint rewriting all that
    if (this.type !== ContainerType.Container) {
      this.block.dimension.schedule(1).on(() => {
        if (!this.getAllOccupants().some(([occupant]) => occupant === player)) return;

        for (let slot = 0; slot < this.getSize(); slot++) {
          this.updateSlot(slot);
        }
      });
    }

    // Return the container identifier
    return identifier;
  }
}

export { BlockContainer };
