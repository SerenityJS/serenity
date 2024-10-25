import {
  BlockEventPacket,
  BlockEventType,
  BlockPosition,
  ContainerId,
  ContainerType,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { Player } from "../../entity";
import { BlockIdentifier } from "../../enums";
import { BlockContainer } from "../index";
import { Block } from "../block";

import { BlockTrait } from "./trait";

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
  }

  public onInteract(player: Player): void {
    // Check if the player is sneaking
    if (player.isSneaking) return;

    // Show the container to the player
    this.container.show(player);
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
