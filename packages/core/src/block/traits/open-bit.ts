import { AbilityIndex, LevelSoundEvent } from "@serenityjs/protocol";

import { BlockInteractionOptions } from "../../types";
import { BlockIdentifier, CardinalDirection } from "../../enums";

import { BlockTrait } from "./trait";

import type { BlockState } from "../types";

/**
 * The directions opposite each direction.
 */
const OppositeDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.North,
  [CardinalDirection.East]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.East
};

class BlockOpenBitTrait extends BlockTrait {
  public static readonly identifier = "open-bit";
  public static readonly state = "open_bit";

  public onInteract(options: BlockInteractionOptions): void {
    // Get the origin of the interaction
    const { origin, cancel } = options;

    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Check if the block is a barrel
    if (this.block.type.identifier === BlockIdentifier.Barrel) return;

    // Iron doors and trapdoors are only opened by redstone
    if (this.block.type.identifier.startsWith("minecraft:iron_")) return;

    // Players sneaking with a block in hand place it rather than open or close the block
    if (origin.isSneaking && options.placingBlock) return;

    // Opening or closing the block takes the place of placing a block on it
    options.placingBlock = false;

    // Get the current state of the block
    const open = this.block.getState<boolean>("open_bit");

    // Check if the interaction has been cancelled
    if (cancel || !origin.abilities.getAbility(AbilityIndex.DoorsAndSwitches)) {
      // Revert the state of the block
      return this.setBit(open, true);
    }

    // A fence gate swings away from the player, so one opened from its far side turns round first
    if (!open && this.block.identifier.endsWith("fence_gate")) {
      // Get the direction the player faces, and the direction the gate faces
      const facing = origin.getCardinalDirection();
      const direction = this.block.getState<string>(
        "minecraft:cardinal_direction"
      );

      // Check if the player faces the gate from its far side
      const opposite = CardinalDirection[OppositeDirections[facing]];
      if (direction === opposite.toLowerCase()) {
        // Turn the gate round as it opens
        return this.setBit(true, false, {
          "minecraft:cardinal_direction":
            CardinalDirection[facing].toLowerCase()
        });
      }
    }

    // Open or close the block
    this.setBit(!open);
  }

  /**
   * Opens or closes the block, along with the other half of a door, and plays the sound of its kind.
   * @param open Whether the block is open.
   * @param silent Whether no sound is played.
   * @param state Other states of the block to change along with it.
   */
  public setBit(open: boolean, silent = false, state?: BlockState): void {
    // Check if the state is already set
    if (this.block.getState<boolean>("open_bit") === open && !state) return;

    // Update the state of the block
    const permutation = this.block.type.getPermutation({
      ...this.block.permutation.state,
      ...state,
      open_bit: open
    });
    this.block.setPermutation(permutation);

    // A door's two halves open and close together
    if (this.block.identifier.endsWith("_door")) {
      // Get the other half of the door
      const other = this.block.getState<boolean>("upper_block_bit")
        ? this.block.below()
        : this.block.above();

      // Open or close the other half, if it is the same door
      if (other.identifier === this.block.identifier)
        other.setState("open_bit", open);
    }

    // Check if the block is silent
    if (silent) return;

    // Play the sound of the kind of block
    this.block.playSound(this.getSound(open));
  }

  /**
   * Gets the sound the block makes as it opens or closes.
   * @param open Whether the block is opening.
   */
  protected getSound(open: boolean): LevelSoundEvent {
    // Get the identifier of the block
    const identifier = this.block.identifier;

    // Levers click on and off
    if (identifier === BlockIdentifier.Lever)
      return open ? LevelSoundEvent.PowerOn : LevelSoundEvent.PowerOff;

    // Trapdoors, fence gates and barrels have sounds of their own
    if (identifier.endsWith("trapdoor"))
      return open
        ? LevelSoundEvent.TrapdoorOpen
        : LevelSoundEvent.TrapdoorClose;

    if (identifier.endsWith("fence_gate"))
      return open
        ? LevelSoundEvent.FenceGateOpen
        : LevelSoundEvent.FenceGateClose;

    if (identifier === BlockIdentifier.Barrel)
      return open ? LevelSoundEvent.BarrelOpen : LevelSoundEvent.BarrelClose;

    // Otherwise, the block is a door
    return open ? LevelSoundEvent.DoorOpen : LevelSoundEvent.DoorClose;
  }
}

export { BlockOpenBitTrait };
