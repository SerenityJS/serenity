import {
  AbilityIndex,
  BlockEventPacket,
  BlockEventType,
  BlockPosition,
  ContainerId,
  ContainerType,
  LevelSoundEvent,
  LevelSoundEventPacket,
  Vector3f
} from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { BlockContainer } from "../index";
import { Block } from "../block";
import { Container } from "../../container";
import {
  BlockInteractionOptions,
  BlockInventoryTraitOptions,
  ItemStackEntry,
  ItemStorage
} from "../../types";
import { ItemStack } from "../../item";

import { BlockTrait } from "./trait";

class BlockInventoryTrait extends BlockTrait {
  public static readonly identifier: string = "inventory";
  public static readonly types = [BlockIdentifier.Chest];

  public container: BlockContainer;

  /**
   * The property used to store the inventory items.
   */
  public get property(): ItemStorage {
    return this.block.getDynamicProperty("inventory") as ItemStorage;
  }

  /**
   * The property used to store the inventory items.
   */
  public set property(value: ItemStorage) {
    this.block.setDynamicProperty<ItemStorage>("inventory", value);
  }

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
      options?.identifier ?? ContainerId.None,
      27
    );
  }

  public onInteract({ cancel, origin }: BlockInteractionOptions): void {
    // Check if the block interaction has been cancelled
    if (cancel || !origin) return;

    // Check if the player is sneaking
    if (origin.isSneaking || !origin.abilities.get(AbilityIndex.OpenContainers))
      return;

    // Show the container to the player
    this.container.show(origin);
  }

  public onBreak(): void {
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

  public onContainerUpdate(container: Container): void {
    // Verify the container is the same as the block container
    if (container !== this.container) return;

    // Prepare the items array
    const items: Array<[number, ItemStackEntry]> = [];

    // Iterate over each item in the container
    for (let i = 0; i < this.container.size; i++) {
      // Get the item stack at the index
      const itemStack = this.container.getItem(i);

      // Check if the item is null
      if (itemStack === null) continue;

      // Push the item stack entry to the inventory items
      items.push([i, itemStack.getDataEntry()]);
    }

    // Set the inventory property to the block
    this.property = { size: this.container.size, items };
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
  public onOpen(): void {
    // Create a new BlockEventPacket
    const event = new BlockEventPacket();
    event.position = this.block.position;
    event.type = BlockEventType.ChangeState;
    event.data = 1;

    // Create a new LevelSoundEventPacket
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Set the sound event based on the block type
    switch (this.block.identifier) {
      default: {
        sound.event = -1 as LevelSoundEvent;
        break;
      }

      case BlockIdentifier.Chest:
      case BlockIdentifier.TrappedChest: {
        sound.event = LevelSoundEvent.ChestOpen;
        break;
      }
    }

    // Broadcast the block event packet
    this.block.dimension.broadcast(event, sound);
  }

  /**
   * Called when the state of the inventory is set to close.
   */
  public onClose(): void {
    // Create a new block event packet
    const packet = new BlockEventPacket();
    packet.position = this.block.position;
    packet.type = BlockEventType.ChangeState;
    packet.data = 0;

    // Create a new level sound event packet
    const sound = new LevelSoundEventPacket();
    sound.position = BlockPosition.toVector3f(this.block.position);
    sound.data = this.block.permutation.networkId;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;
    sound.uniqueActorId = -1n;

    // Set the sound event based on the block type
    switch (this.block.type.identifier) {
      default: {
        sound.event = -1 as LevelSoundEvent;
        break;
      }

      case BlockIdentifier.Chest:
      case BlockIdentifier.TrappedChest: {
        sound.event = LevelSoundEvent.ChestClosed;
        break;
      }
    }

    // Broadcast the block event packet
    this.block.dimension.broadcast(packet, sound);
  }

  public onAdd(): void {
    // Get the item storage property
    const property = this.block.getDynamicProperty<ItemStorage>("inventory");

    // Check if the block has an inventory property
    if (property) {
      // Iterate over the items in the property
      for (const [slot, item] of property.items) {
        // Create a new item stack from the item entry
        const stack = ItemStack.fromDataEntry(item);

        // Set the item stack in the container
        this.container.setItem(slot, stack);
      }
    } else {
      // Create the item storage property
      this.block.setDynamicProperty<ItemStorage>("inventory", {
        size: this.container.size,
        items: []
      });
    }
  }

  public onRemove(): void {
    // Remove the item storage property
    this.block.removeDynamicProperty("inventory");
  }
}

export { BlockInventoryTrait };
