import {
  AbilityIndex,
  BlockPosition,
  LevelSoundEvent,
  LevelSoundEventPacket
} from "@serenityjs/protocol";

import { BlockInteractionOptions } from "../../types";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockOpenBitTrait extends BlockTrait {
  public static readonly identifier = "open-bit";
  public static readonly state = "open_bit";

  public onInteract({ origin, cancel }: BlockInteractionOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Check if the block is a barrel
    if (this.block.type.identifier === BlockIdentifier.Barrel) return;

    // Check if the interaction has been cancelled
    if (cancel || !origin.abilities.getAbility(AbilityIndex.DoorsAndSwitches)) {
      // Get the current state of the block
      const state = this.block.getState<boolean>("open_bit");

      // Revert the state of the block
      return this.setBit(state, true);
    }

    // Get the state of the block
    const state = this.block.getState<boolean>("open_bit");

    // Set the bit of the block
    this.setBit(!state);
  }

  public setBit(open: boolean, silent = false): void {
    // Get the state of the block
    const state = this.block.getState<boolean>("open_bit");

    // Check if the state is already set
    if (state === open) return;

    // Update the state of the block
    this.block.setState("open_bit", open);

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

    // Check if the block is a barrel
    if (identifier.includes("barrel")) {
      packet.event = open
        ? LevelSoundEvent.BarrelOpen
        : LevelSoundEvent.BarrelClose;
    }

    // Send the packet to the dimension
    this.block.dimension.broadcast(packet);
  }
}

export { BlockOpenBitTrait };
