import { BLOCK_TYPES } from "@serenityjs/data";

import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * The directions a quarter turn clockwise from each direction, seen from above.
 */
const ClockwiseDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.East,
  [CardinalDirection.East]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.North
};

/**
 * The directions a quarter turn counter clockwise from each direction, seen from above.
 */
const CounterClockwiseDirections: Record<CardinalDirection, CardinalDirection> =
  {
    [CardinalDirection.North]: CardinalDirection.West,
    [CardinalDirection.West]: CardinalDirection.South,
    [CardinalDirection.South]: CardinalDirection.East,
    [CardinalDirection.East]: CardinalDirection.North
  };

/**
 * Places doors as vanilla does. The upper half goes in the space above, in the same state as the lower half,
 * and a door hinges on its right when there is a door to its left to pair with,
 * or a full block to its right and not to its left.
 * Opening and closing both halves together is done by the open bit trait.
 */
class BlockDoorTrait extends BlockTrait {
  public static readonly identifier = "door";
  public static readonly types = BLOCK_TYPES.filter((type) =>
    type.identifier.endsWith("_door")
  ).map((type) => type.identifier);

  public onPlace({ cancel, origin }: BlockPlacementOptions): boolean | void {
    // Check if the placement was cancelled, or if this is the upper half, which the lower half places
    if (cancel || this.block.getState<boolean>("upper_block_bit")) return;

    // A door needs the space above for its upper half
    const above = this.block.above();
    if (!above.isReplaceable) return false;

    // Check if the door hinges on its right, from the way the player placing it faces
    if (origin?.isPlayer()) {
      const hinge = this.hingesRight(origin.getCardinalDirection());
      this.block.setState("door_hinge_bit", hinge);
    }

    // Place the upper half, in the same state as the lower half
    const permutation = this.block.type.getPermutation({
      ...this.block.permutation.state,
      upper_block_bit: true
    });
    above.setPermutation(permutation);
  }

  /**
   * Whether a door placed by a player facing a direction hinges on its right:
   * when there is a door to its left to pair with, or a full block to its right and not to its left.
   * @param facing The direction the player placing the door faces.
   */
  public hingesRight(facing: CardinalDirection): boolean {
    // Get the blocks to the left and right of the door, as the player sees it
    const left = this.getSide(CounterClockwiseDirections[facing]);
    const right = this.getSide(ClockwiseDirections[facing]);

    // Pair with a door to the left, or hinge against a wall to the right
    return (
      left.identifier.endsWith("_door") || (right.isSolid && !left.isSolid)
    );
  }

  /**
   * Gets the block beside the door in a direction.
   * @param direction The direction of the block.
   */
  protected getSide(direction: CardinalDirection): Block {
    switch (direction) {
      case CardinalDirection.North:
        return this.block.north();
      case CardinalDirection.South:
        return this.block.south();
      case CardinalDirection.East:
        return this.block.east();
      case CardinalDirection.West:
        return this.block.west();
    }
  }
}

export { BlockDoorTrait };
