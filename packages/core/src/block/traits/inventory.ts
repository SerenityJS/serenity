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
  public static readonly identifier = "inventory";

  public static readonly types = [BlockIdentifier.Chest];

  protected opened = false;

  public readonly container: BlockContainer;

  public readonly containerType: ContainerType;

  public readonly containerId: ContainerId;

  public readonly inventorySize: number;

  public constructor(block: Block) {
    super(block);

    // Create the container for the block based on the block type
    switch (block.getType().identifier) {
      default: {
        // Set the container type and id
        this.containerType = ContainerType.Container;
        this.containerId = ContainerId.None;
        this.inventorySize = 27;
        break;
      }
    }

    // Create the container for the trait
    this.container = new BlockContainer(
      block,
      this.containerType,
      this.containerId,
      this.inventorySize
    );

    // Check if the block has an inventory component
    if (block.components.has("inventory")) {
      // Get the inventory component from the block
      const inventory = block.components.get("inventory") as InventoryComponent;
      // Iterate over each item in the inventory
      for (const [slot, entry] of inventory.items) {
        // Create a new item stack
        const stack = new ItemStack(entry.identifier, {
          amount: entry.amount,
          auxillary: entry.auxillary,
          world: block.dimension.world,
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
      size: this.inventorySize,
      items: []
    };

    // Iterate over each item in the container
    for (let i = 0; i < this.inventorySize; i++) {
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
      switch (this.block.getType().identifier) {
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

    // Check if the container has no occupants
    if (this.container.occupants.size === 0 && this.opened) {
      // Set the block state to closed
      this.opened = false;

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
      switch (this.block.getType().identifier) {
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
}

export { BlockInventoryTrait };
