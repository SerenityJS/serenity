import {
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { Block } from "../block";
import { BlockInteractionOptions } from "../../types";

import { BlockTrait } from "./trait";

class BlockOpenBitTrait extends BlockTrait {
  public static readonly identifier = "open-bit";
  public static readonly state = "open_bit";

  public async onInteract({
    origin
  }: BlockInteractionOptions): Promise<boolean> {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return false;

    // Check if the player can open doors
    if (!origin.abilities.doorsAndSwitches) return false;

    // Get the state of the block
    const state = this.block.permutation.state as Record<string, unknown>;

    // Get the open bit of the block
    const openBit = state.open_bit as boolean;

    // Set the bit of the block
    await this.setBit(!openBit);

    // If the player is sneaking, we should place the block and interact with it door.
    // If the player is not sneaking, we should just interact with the door.
    return origin.isSneaking; // The sneaking state of the player will be used to determine the action.
  }

  public async setBit(open: boolean, silent = false): Promise<void> {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state as Record<string, unknown>;

    // Check if the block is a door
    if (typeof state["upper_block_bit"] === "boolean") {
      // Get the upper block bit of the block
      const upperBlockBit = state["upper_block_bit"] as boolean;

      // Get the above and below blocks
      // Get the above and below blocks
      const above: Block = upperBlockBit
        ? this.block
        : await this.block.above();
      const below: Block = upperBlockBit
        ? await this.block.below()
        : this.block;

      // Get the state of the above block
      const aboveState = above.permutation.state as Record<string, unknown>;

      // Create the state of the above block
      const aboveNewState = {
        ...aboveState,
        open_bit: open
      };

      // Get the permutation of the above block
      const abovePermutation = type.getPermutation(aboveNewState);

      // Set the permutation of the above block
      if (abovePermutation) await above.setPermutation(abovePermutation);

      // Get the state of the below block
      const belowState = below.permutation.state as Record<string, unknown>;

      // Create the state of the below block
      const belowNewState = {
        ...belowState,
        open_bit: open
      };

      // Get the permutation of the below block
      const belowPermutation = type.getPermutation(belowNewState);

      // Set the permutation of the below block
      if (belowPermutation) await below.setPermutation(belowPermutation);
    } else {
      // Create the state of the block
      const newState = {
        ...state,
        open_bit: open
      };

      // Get the permutation of the block
      const permutation = type.getPermutation(newState);

      // Set the permutation of the block
      if (permutation) await this.block.setPermutation(permutation);
    }

    // Check if the block is silent
    if (silent) return;

    // Get the position of the block and the identifier
    const identifier = this.block.type.identifier;

    // Create the level sound event packet
    const packet = new LevelSoundEventPacket();
    packet.data = this.block.permutation.networkId;
    packet.event = open ? LevelSoundEvent.DoorOpen : LevelSoundEvent.DoorClose;
    packet.position = BlockPosition.toVector3f(this.block.position);
    packet.actorIdentifier = String();
    packet.isBabyMob = false;
    packet.isGlobal = true;
    packet.uniqueActorId = -1n;

    // Check if the block is a trapdoor
    if (identifier.includes("trapdoor")) {
      packet.event = open
        ? LevelSoundEvent.TrapdoorOpen
        : LevelSoundEvent.TrapdoorClose;
    }

    // Check if the block is a fence gate
    if (identifier.includes("fence_gate")) {
      packet.event = open
        ? LevelSoundEvent.FenceGateOpen
        : LevelSoundEvent.FenceGateClose;
    }

    // Send the packet to the dimension
    return this.block.dimension.broadcast(packet);
  }
}

export { BlockOpenBitTrait };
