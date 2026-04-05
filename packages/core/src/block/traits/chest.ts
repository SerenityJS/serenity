import {
  AbilityIndex,
  BlockEventPacket,
  BlockEventType,
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";
import { IntTag } from "@serenityjs/nbt";

import {
  Block,
  BlockDestroyOptions,
  BlockInteractionOptions,
  BlockPlacementOptions
} from "../..";
import { BlockIdentifier } from "../../enums";

import { BlockInventoryTrait } from "./inventory";

class BlockChestTrait extends BlockInventoryTrait {
  public static readonly identifier: string = "chest";
  public static readonly types = [
    BlockIdentifier.Chest,
    BlockIdentifier.TrappedChest
  ];

  private static readonly pairAxis = {
    north: "x",
    south: "x",
    east: "z",
    west: "z"
  } as const;

  public static shouldBePairParent(
    current: BlockPosition,
    other: BlockPosition,
    direction: string
  ): boolean {
    const axis = this.pairAxis[direction as keyof typeof this.pairAxis];
    if (!axis) return current.x !== other.x ? current.x < other.x : current.z < other.z;

    return direction === "north" || direction === "east"
      ? current[axis] > other[axis]
      : current[axis] < other[axis];
  }

  public static getPairCandidates(
    block: Block,
    direction: string
  ): Array<Block> {
    return this.pairAxis[direction as keyof typeof this.pairAxis] === "x"
      ? [block.east(), block.west()]
      : this.pairAxis[direction as keyof typeof this.pairAxis] === "z"
        ? [block.north(), block.south()]
        : [];
  }

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
    this.container.setSize(isParent ? 54 : 27);
  }

  public onPlace(_options?: BlockPlacementOptions): void {}

  public onUpdate(_source?: Block): void {
    // Preserve saved pairing and only repair invalid state. Double chests
    // should pair when placed, not opportunistically on later world updates.
    if (!this.isPaired()) return;

    const pairedPos = this.getPaired();
    if (!pairedPos) return this.clearPaired();

    const paired = this.dimension.getBlock(pairedPos);
    if (!paired.hasTrait(BlockChestTrait)) return this.clearPaired();

    const trait = paired.getTrait(BlockChestTrait);
    if (!trait.isPaired()) return this.clearPaired();

    const reciprocal = trait.getPaired();
    if (!reciprocal || !reciprocal.equals(this.block.position)) {
      return this.clearPaired();
    }

    const direction = this.block.getState("minecraft:cardinal_direction");
    const sourceDirection = paired.getState("minecraft:cardinal_direction");
    if (direction !== sourceDirection) {
      this.clearPaired();
      trait.clearPaired();
      return;
    }

    const validPairPositions = BlockChestTrait.getPairCandidates(
      this.block,
      String(direction)
    );
    if (!validPairPositions.some((block) => block.position.equals(paired.position))) {
      this.clearPaired();
      trait.clearPaired();
      return;
    }
  }

  public pair(): void {
    if (this.hasValidPair()) return;
    if (this.isPaired()) this.clearPaired();

    const direction = this.block.getState("minecraft:cardinal_direction");

    for (const neighbor of BlockChestTrait.getPairCandidates(
      this.block,
      String(direction)
    )) {
      if (!neighbor.hasTrait(BlockChestTrait)) continue;

      const trait = neighbor.getTrait(BlockChestTrait);
      if (!trait || trait.isPaired()) continue;

      const sourceDirection = neighbor.getState("minecraft:cardinal_direction");
      if (direction !== sourceDirection) continue;

      this.setPaired(neighbor.position);
      trait.setPaired(this.block.position);

      const isParent = BlockChestTrait.shouldBePairParent(
        this.block.position,
        neighbor.position,
        String(direction)
      );
      this.setIsPairParent(isParent);
      trait.setIsPairParent(!isParent);
      return;
    }
  }

  public onBreak(options?: BlockDestroyOptions): void {
    // Check if the break was cancelled or there is no origin
    if (!options?.origin || options?.cancel) return;

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
        // Move the child items from the parent container to the child container
        for (let i = 27; i < this.container.getSize(); i++) {
          // Get the item from this container
          const item = this.container.getItem(i);

          // Move the item to the paired container
          if (item) {
            this.container.swapItems(i, i - 27, pairedChestTrait.container);
          }
        }

        // Close the container for all occupants
        for (const [occupant] of this.container.getAllOccupants()) {
          // Close the container for each occupant
          this.container.close(occupant);
        }
      } else {
        // Move the child items from the parent container to the child container
        for (let i = 27; i < pairedChestTrait.container.getSize(); i++) {
          // Get the item from this container
          const item = pairedChestTrait.container.getItem(i);

          // Move the item to the paired container
          if (item) {
            pairedChestTrait.container.swapItems(i, i - 27, this.container);
          }
        }

        // Close the container for all occupants of the paired chest
        for (const [occupant] of pairedChestTrait.container.getAllOccupants()) {
          // Close the container for each occupant
          pairedChestTrait.container.close(occupant);
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
    } else {
      // Close the container for all occupants
      for (const [occupant] of this.container.getAllOccupants()) {
        // Close the container for each occupant
        this.container.close(occupant);
      }
    }

    // Call the super method
    super.onBreak(options);
  }

  public onInteract(options: BlockInteractionOptions): void {
    const { cancel, origin } = options;
    if (cancel || !origin) return;

    if (
      origin.isSneaking ||
      !origin.abilities.getAbility(AbilityIndex.OpenContainers)
    ) {
      return;
    }

    const trait = this.getSharedContainerTrait();
    if (trait.isPaired() && trait.container.getSize() !== 54) {
      trait.container.setSize(54);
    }

    // Open the canonical double chest container, but keep the clicked half as
    // the window anchor so the client opens the correct block position.
    trait.container.show(origin, this.block.position);
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
      for (let i = 0; i < trait.container.getSize(); i++) {
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

    this.broadcastChestState(1, LevelSoundEvent.ChestOpen);

    if (this.isPaired()) {
      const paired = this.dimension.getBlock(this.getPaired()!);
      this.broadcastChestState(1, LevelSoundEvent.ChestOpen, paired);
    }
  }

  public onClose(silent?: boolean): void {
    if (this.isPaired() && this.getIsPairParent()) {
      // Get the paired block from the dimension
      const paired = this.dimension.getBlock(this.getPaired()!);

      // Get the chest trait from the paired block
      const trait = paired.getTrait(BlockChestTrait);

      // Iterate through the second half of the container and move items back to the paired container
      for (let i = 27; i < this.container.getSize(); i++) {
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

    this.broadcastChestState(0, LevelSoundEvent.ChestClosed);

    if (this.isPaired()) {
      const paired = this.dimension.getBlock(this.getPaired()!);
      this.broadcastChestState(0, LevelSoundEvent.ChestClosed, paired);
    }
  }

  private broadcastChestState(
    data: number,
    soundEvent: LevelSoundEvent,
    block: Block = this.block
  ): void {
    const event = new BlockEventPacket();
    event.position = block.position;
    event.type = BlockEventType.ChangeState;
    event.data = data;

    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(block.position);
    sound.event = soundEvent;
    sound.data = block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    this.dimension.broadcast(event, sound);
  }

  private getSharedContainerTrait(): BlockChestTrait {
    if (!this.isPaired() || this.getIsPairParent()) return this;

    const paired = this.getPaired();
    if (!paired) return this;

    const block = this.dimension.getBlock(paired);
    if (!block.hasTrait(BlockChestTrait)) return this;

    const trait = block.getTrait(BlockChestTrait);
    return trait.getIsPairParent() ? trait : this;
  }

  private hasValidPair(): boolean {
    const pairedPos = this.getPaired();
    if (!pairedPos) return false;

    const paired = this.dimension.getBlock(pairedPos);
    return (
      paired.hasTrait(BlockChestTrait) &&
      paired.getTrait(BlockChestTrait).getPaired()?.equals(this.block.position) === true
    );
  }
}

export { BlockChestTrait };
