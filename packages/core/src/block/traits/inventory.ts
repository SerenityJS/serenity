import {
  AbilityIndex,
  BlockPosition,
  ContainerType,
  Vector3f
} from "@serenityjs/protocol";
import { CompoundTag, IntTag, ListTag } from "@serenityjs/nbt";

import { BlockContainer } from "../container";
import { Block } from "../block";
import {
  BlockDestroyOptions,
  BlockInteractionOptions,
  BlockInventoryTraitOptions
} from "../../types";
import { ItemStack } from "../../item";

import { BlockTrait } from "./trait";

class BlockInventoryTrait extends BlockTrait {
  public static readonly identifier: string = "inventory";

  public container: BlockContainer;

  /**
   * Whether the block is opened or not.
   */
  protected opened = false;

  /**
   * Create a new inventory trait for a specific block.
   * @param block The block to create the trait for.
   * @param options The options for the block inventory trait.
   */
  public constructor(
    block: Block,
    options?: Partial<BlockInventoryTraitOptions>
  ) {
    super(block);

    // Create the container for the trait
    this.container = new BlockContainer(
      block,
      options?.type ?? ContainerType.Container,
      27
    );
  }

  public onInteract({ cancel, origin }: BlockInteractionOptions): void {
    // Check if the block interaction has been cancelled
    if (cancel || !origin) return;

    // Check if the player is sneaking
    if (
      origin.isSneaking ||
      !origin.abilities.getAbility(AbilityIndex.OpenContainers)
    )
      return;

    // Show the container to the player
    this.container.show(origin);
  }

  public onBreak(options?: BlockDestroyOptions): void {
    // Check if the break was cancelled or there is no origin
    if (!options?.origin || options?.cancel) return;

    // Loop through the items in the container
    for (const item of this.container.storage) {
      // Check if the item is valid
      if (!item) continue;

      // Spawn the item in the world
      const position = BlockPosition.toVector3f(this.block.position);

      // Update the position to the center of the block
      position.x += 0.5;
      position.y += 0.5;
      position.z += 0.5;

      // Spawn the item entity in the dimension
      const entity = this.dimension.spawnItem(item, position);

      // Generate a random motion vector
      const vx = Math.random() * 0.6 - 0.35;
      const vy = Math.random() * 0.35;
      const vz = Math.random() * 0.6 - 0.35;

      // Set the item stack motion vector
      entity.setMotion(new Vector3f(vx, vy, vz));
    }
  }

  public onTick(): void {
    // Check if the container has occupants and the block is not opened
    if (!this.opened && this.container.occupants.size > 0) {
      // Set the block state to open
      this.opened = true;

      // Call the onOpen method
      this.onOpen();
    }

    // Check if the container has no occupants
    if (this.opened && this.container.occupants.size === 0) {
      // Set the block state to closed
      this.opened = false;

      // Call the onClose method
      this.onClose();
    }
  }

  /**
   * Called when the state of the inventory is set to open.
   */
  public onOpen(_silent?: boolean): void {
    // Create a new items list tag
    const items = new ListTag<CompoundTag>();

    // Iterate over the container slots
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(i);

      // Check if the item is null
      if (!itemStack) continue;

      // Get the item stack level storage
      const storage = itemStack.getStorage();

      // Create a new int tag for the slot
      storage.add(new IntTag(i, "Slot"));

      // Add the item stack storage to the items list tag
      items.push(storage);
    }

    // Add the items to the items list tag
    this.block.setStorageEntry("Items", items);
  }

  /**
   * Called when the state of the inventory is set to close.
   */
  public onClose(_silent?: boolean): void {
    // Create a new items list tag
    const items = new ListTag<CompoundTag>();

    // Iterate over the container slots
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(i);

      // Check if the item is null
      if (!itemStack) continue;

      // Get the item stack level storage
      const storage = itemStack.getStorage();

      // Create a new int tag for the slot
      storage.add(new IntTag(i, "Slot"));

      // Add the item stack storage to the items list tag
      items.push(storage);
    }

    // Add the items to the items list tag
    this.block.setStorageEntry("Items", items);
  }

  public onAdd(): void {
    // Check if block has an items nbt property
    if (this.block.hasStorageEntry("Items")) {
      // Get the items tag from the block's nbt
      const items = this.block.getStorageEntry<ListTag<CompoundTag>>("Items");

      // Get the world from the block
      const world = this.block.world;

      // Iterate over each item in the items list
      for (const storage of items?.values() ?? []) {
        try {
          // Create a new item stack from the level storage
          const itemStack = ItemStack.fromLevelStorage(world, storage);

          // Get the slot from the storage
          const slot = storage.get<IntTag>("Slot")?.valueOf() ?? 0;

          // Set the item stack to the container
          this.container.setItem(slot, itemStack);
        } catch (reason) {
          // Get the position of the block
          const { x, y, z } = this.block.position;

          // Create a new error message
          const message = (reason as Error).message || "Unknown error";

          // Log an error if the item stack creation fails
          this.block.world.logger.warn(
            `Skipping ItemStack for block container "§u${this.block.identifier}§r" @ §7(§u${x}§7, §u${y}§7, §u${z}§7)§r, as ${message}§r`
          );
        }
      }
    } else {
      // Create a new items list tag
      const items = new ListTag<CompoundTag>([], "Items");

      // Add the items list tag to the block's nbt
      this.block.addStorageEntry(items);
    }
  }

  public onRemove(): void {
    // Delete the items list tag from the block's nbt
    this.block.deleteStorageEntry("Items");
  }
}

export { BlockInventoryTrait };
