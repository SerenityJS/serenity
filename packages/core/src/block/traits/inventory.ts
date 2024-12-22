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
import { ItemStackEntry, ItemStorage } from "../../types";

import { BlockTrait } from "./trait";

class BlockInventoryTrait extends BlockTrait {
  public static readonly identifier: string = "inventory";
  public static readonly types = [BlockIdentifier.Chest];

  public container: BlockContainer;

  /**
   * The component used to store the inventory items.
   */
  public get component(): ItemStorage {
    return this.block.getComponent("inventory") as ItemStorage;
  }

  /**
   * The component used to store the inventory items.
   */
  public set component(value: ItemStorage) {
    this.block.setComponent<ItemStorage>("inventory", value);
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
      const position = this.block.position;
      const vector = BlockPosition.toVector3f(position);

      // Spawn the item entity in the dimension
      this.block.dimension.spawnItem(
        item,
        vector.add(new Vector3f(0.5, 0.5, 0.5))
      );
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

    // Set the inventory component to the block
    this.component = { size: this.container.size, items };
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

  public onAdd(): void {
    // Check if the block has an inventory component
    if (this.block.components.has("inventory")) return;

    // Create the item storage component
    this.block.setComponent<ItemStorage>("inventory", {
      size: this.container.size,
      items: []
    });
  }

  public onRemove(): void {
    // Remove the item storage component
    this.block.removeComponent("inventory");
  }
}

export { BlockInventoryTrait };
