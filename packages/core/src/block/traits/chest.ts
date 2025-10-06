import {
  BlockEventPacket,
  BlockEventType,
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";
import { IntTag } from "@serenityjs/nbt";

import { Block, BlockDestroyOptions, BlockInteractionOptions } from "../..";
import { BlockIdentifier } from "../../enums";

import { BlockInventoryTrait } from "./inventory";

class BlockChestTrait extends BlockInventoryTrait {
  public static readonly identifier: string = "chest";
  public static readonly types = [
    BlockIdentifier.Chest,
    BlockIdentifier.TrappedChest
  ];

  public isPaired(): boolean {
    // Get the pairx and pairz storage entries
    const pairx = this.block.getStorageEntry("pairx");
    const pairz = this.block.getStorageEntry("pairz");

    // Return whether both entries are not null
    return pairx !== null && pairz !== null;
  }

  public getPaired(): BlockPosition | null {
    // Check if the chest is paired
    if (!this.isPaired()) return null;

    // Get the pairx and pairz storage entries
    const pairx = this.block.getStorageEntry("pairx");
    const pairz = this.block.getStorageEntry("pairz");

    // Return the paired position
    return new BlockPosition(
      pairx ? (pairx as IntTag).valueOf() : 0,
      this.block.position.y,
      pairz ? (pairz as IntTag).valueOf() : 0
    );
  }

  public setPaired(position: BlockPosition): void {
    // Set the pairx and pairz storage entries
    this.block.setStorageEntry("pairx", new IntTag(position.x));
    this.block.setStorageEntry("pairz", new IntTag(position.z));
  }

  public clearPaired(): void {
    // Remove the pairx and pairz storage entries
    this.block.deleteStorageEntry("pairx");
    this.block.deleteStorageEntry("pairz");

    // Reset the isParent flag
    this.setIsPairParent(false);
  }

  public getIsPairParent(): boolean {
    // Get the lead storage entry
    const lead = this.block.getStorageEntry<IntTag>("pairlead");

    // If the lead entry is null, return false
    if (!lead) return false;

    // Return whether the lead entry is 1
    return lead.valueOf() === 1;
  }

  public setIsPairParent(isParent: boolean): void {
    // Set the lead storage entry
    this.block.setStorageEntry("pairlead", new IntTag(isParent ? 1 : 0));

    // Update the container size
    this.container.size = isParent ? 54 : 27;
  }

  public onUpdate(source?: Block): void {
    // If there is no source, return
    if (!source || source === this.block) return;

    if (source.hasTrait(BlockChestTrait) && !this.isPaired()) {
      // Get the chest trait from the source block
      const trait = source.getTrait(BlockChestTrait);

      // If the source chest is paired, return
      if (!trait || trait?.isPaired()) return;

      // Verify that they are facing the same direction
      const direction = this.block.getState("minecraft:cardinal_direction");
      const sourceDirection = source.getState("minecraft:cardinal_direction");
      if (direction !== sourceDirection) return;

      // Set the pairing
      this.setPaired(source.position);
      trait.setPaired(this.block.position);

      // Set the parent/child relationship
      this.setIsPairParent(true);
      trait.setIsPairParent(false);
    }
  }

  public onBreak(options?: BlockDestroyOptions): void {
    // Check if the break was cancelled or there is no origin
    if (!options?.origin || options?.cancel) return;

    // Call the super method
    super.onBreak(options);

    // Check if the chest is paired
    if (this.isPaired()) {
      // Get the paired position
      const pairedPos = this.getPaired();
      if (!pairedPos) return;

      // Get the paired block
      const pairedBlock = this.block.dimension.getBlock(pairedPos);

      // Get the paired chest trait
      const pairedChestTrait = pairedBlock.getTrait(BlockChestTrait);

      // Check if the block is the parent
      if (this.getIsPairParent()) {
        // Move items from this container to the paired container
        for (let i = 27; i < this.container.size; i++) {
          // Get the item from the container
          const item = this.container.getItem(i);

          // Move the item to the paired container
          if (item)
            this.container.swapItems(i, i - 27, pairedChestTrait.container);
        }
      } else {
        // Move items from the paired container to this container
        for (let i = 0; i < pairedChestTrait.container.size; i++) {
          // Get the item from the paired container
          const item = pairedChestTrait.container.getItem(i);

          // Move the item to this container
          if (item)
            pairedChestTrait.container.swapItems(i, i + 27, this.container);
        }
      }

      // Check if the paired block is a chest
      if (
        pairedBlock &&
        pairedBlock.hasTrait(BlockChestTrait) &&
        pairedBlock.getTrait(BlockChestTrait).isPaired()
      ) {
        // Clear the pairing
        pairedBlock.getTrait(BlockChestTrait).clearPaired();
      }
    }
  }

  public onInteract({ cancel, origin }: BlockInteractionOptions): void {
    if (cancel || !origin) return;

    // Check if the chest is paired and this chest is the child
    if (this.isPaired() && !this.getIsPairParent()) {
      // Get the paired block from the dimension
      const paired = this.dimension.getBlock(this.getPaired()!);

      // Get the chest trait from the paired block
      const trait = paired.getTrait(BlockChestTrait);

      // Show the paired chest's container to the player
      trait.onInteract({ cancel, origin });
    } else {
      super.onInteract({ cancel, origin });
    }
  }

  public onOpen(silent?: boolean): void {
    // Call the super method
    super.onOpen();

    // Check if the chest is paired and is the parent
    if (this.isPaired() && this.getIsPairParent()) {
      // Get the paired block from the dimension
      const paired = this.dimension.getBlock(this.getPaired()!);

      // Get the chest trait from the paired block
      const trait = paired.getTrait(BlockChestTrait);

      // Copy the items from the paired container to the new container
      for (let i = 0; i < trait.container.size; i++) {
        // Get the item from the paired container
        const item = trait.container.getItem(i);

        // Move the item to the new container
        if (item) trait.container.swapItems(i, i + 27, this.container);
      }

      // Call the onOpen method for the paired chest
      trait.onOpen(true);
    }

    // If silent is true, return
    if (silent) return;

    // Create a new BlockEventPacket
    const event = new BlockEventPacket();
    event.position = this.block.position;
    event.type = BlockEventType.ChangeState;
    event.data = 1;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.ChestOpen;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(event, sound);
  }

  public onClose(silent?: boolean): void {
    // Check if the chest is paired and is the parent
    if (this.isPaired() && this.getIsPairParent()) {
      // Get the paired block from the dimension
      const paired = this.dimension.getBlock(this.getPaired()!);

      // Get the chest trait from the paired block
      const trait = paired.getTrait(BlockChestTrait);

      // Iterate through the second half of the container and move items back to the paired container
      for (let i = 27; i < this.container.size; i++) {
        // Get the item from the container
        const item = this.container.getItem(i);

        // Move the item back to the paired container
        if (item) this.container.swapItems(i, i - 27, trait.container);
      }

      // Call the onClose method for the paired chest
      trait.onClose(true);
    }

    // Call the super method
    super.onClose();

    // If silent is true, return
    if (silent) return;

    // Create a new BlockEventPacket
    const event = new BlockEventPacket();
    event.position = this.block.position;
    event.type = BlockEventType.ChangeState;
    event.data = 0;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.event = LevelSoundEvent.ChestClosed;
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Broadcast the packets to the dimension
    this.dimension.broadcast(event, sound);
  }
}

export { BlockChestTrait };
