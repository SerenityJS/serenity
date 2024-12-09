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

import { Player } from "../../entity";
import { BlockIdentifier } from "../../enums";
import { BlockContainer } from "../index";
import { Block } from "../block";
import { Container } from "../../container";
import { ItemStackEntry, JSONLikeObject } from "../../types";
import { ItemStack } from "../../item";

import { BlockTrait } from "./trait";

interface InventoryComponent extends JSONLikeObject {
  size: number;
  items: Array<[number, ItemStackEntry]>;
}

class BlockInventoryTrait extends BlockTrait {
  public static readonly identifier: string = "inventory";

  public static readonly types = [BlockIdentifier.Chest];

  public readonly container: BlockContainer;

  /**
   * The container type of the block.
   */
  public get containerType(): ContainerType {
    return this.container.type;
  }

  /**
   * The container type of the block.
   */
  public set containerType(value: ContainerType) {
    this.container.type = value;
  }

  /**
   * The container id of the block.
   */
  public get containerId(): ContainerId {
    return this.container.identifier;
  }

  /**
   * The container id of the block.
   */
  public set containerId(value: ContainerId) {
    this.container.identifier = value;
  }

  /**
   * The amount of slots in the container.
   */
  public get containerSize(): number {
    return this.container.size;
  }

  /**
   * The amount of slots in the container.
   */
  public set containerSize(value: number) {
    this.container.size = value;
  }

  /**
   * Whether the block is opened or not.
   */
  protected opened = false;

  public constructor(block: Block) {
    super(block);

    // Create the container for the trait
    this.container = new BlockContainer(
      block,
      ContainerType.Container,
      ContainerId.None,
      27
    );
  }

  public onAdd(): void {
    // Check if the block has an inventory component
    if (this.block.components.has("inventory")) {
      // Get the inventory component from the block
      const inventory =
        this.block.getComponent<InventoryComponent>("inventory");

      // Check if the inventory component is valid
      if (!inventory) return;

      // Iterate over each item in the inventory
      for (const [slot, entry] of inventory.items) {
        // Create a new item stack
        const stack = new ItemStack(entry.identifier, {
          amount: entry.amount,
          auxillary: entry.auxillary,
          world: this.block.dimension.world,
          entry
        });

        // Add the item stack to the container
        this.container.setItem(slot, stack);
      }
    }
  }

  public onInteract(player: Player): void {
    // Check if the player is sneaking
    if (player.isSneaking || !player.abilities.get(AbilityIndex.OpenContainers))
      return;

    // Show the container to the player
    this.container.show(player);
  }

  public onBreak(): void {
    // Loop through the items in the container
    for (const item of this.container.storage) {
      // Check if the item is valid
      if (!item) continue;

      // Spawn the item in the world
      const { x, y, z } = this.block.position;
      const entity = this.block.dimension.spawnItem(
        item,
        new Vector3f(x + 0.5, y + 0.5, z + 0.5)
      );

      // Add some upwards velocity to the item.
      entity.setMotion(new Vector3f(0, 0.1, 0));
    }
  }

  public onContainerUpdate(container: Container): void {
    // Verify the container is the same as the block container
    if (container !== this.container) return;

    // Create a new inventory component
    const inventory: InventoryComponent = {
      size: this.containerSize,
      items: []
    };

    // Iterate over each item in the container
    for (let i = 0; i < this.containerSize; i++) {
      // Get the item stack at the index
      const item = this.container.getItem(i);

      // Check if the item is null
      if (item === null) continue;

      // Get the data entry of the item stack
      const entry = item.getDataEntry();

      // Push the item stack entry to the inventory items
      inventory.items.push([i, entry]);
    }

    // Set the inventory component to the block
    this.block.components.set("inventory", inventory);
  }

  public onTick(): void {
    // Check if the container has occupants and the block is not opened
    if (this.container.occupants.size > 0 && !this.opened) {
      // Set the block state to open
      this.opened = true;

      // Call the onOpen method
      this.onOpen();
    }

    // Check if the container has no occupants
    if (this.container.occupants.size === 0 && this.opened) {
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
    sound.data = this.block.permutation.network;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;

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
    sound.data = this.block.permutation.network;
    sound.actorIdentifier = String();
    sound.isBabyMob = false;
    sound.isGlobal = false;

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
}

export { BlockInventoryTrait };
