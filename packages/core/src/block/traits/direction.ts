import { BlockFace } from "@serenityjs/protocol";

import { BlockPlacementOptions } from "../..";
import { BlockIdentifier, CardinalDirection } from "../../enums";

import { BlockTrait } from "./trait";

/**
 * The directions opposite each direction.
 */
const OppositeDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.North,
  [CardinalDirection.East]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.East
};

/**
 * The number the direction state gives each direction: south, west, north and east, from 0.
 */
const LegacyDirections: Record<CardinalDirection, number> = {
  [CardinalDirection.South]: 0,
  [CardinalDirection.West]: 1,
  [CardinalDirection.North]: 2,
  [CardinalDirection.East]: 3
};

/**
 * The direction each side of a block points out to.
 */
const FaceDirections: Partial<Record<BlockFace, CardinalDirection>> = {
  [BlockFace.North]: CardinalDirection.North,
  [BlockFace.South]: CardinalDirection.South,
  [BlockFace.West]: CardinalDirection.West,
  [BlockFace.East]: CardinalDirection.East
};

/**
 * The blocks that face out of the side of the block they are placed against,
 * and turn their front to the player when placed on a floor or ceiling.
 */
const SideFacingBlocks = new Set<string>([
  BlockIdentifier.TripwireHook,
  BlockIdentifier.Cocoa,
  BlockIdentifier.Grindstone,
  BlockIdentifier.Bell
]);

class BlockDirectionTrait extends BlockTrait {
  public static readonly identifier = "direction";
  public static readonly state: string = "direction";

  public onPlace(options: BlockPlacementOptions): boolean | void {
    // Get the origin of the block placement
    const { origin, clickedFace } = options;

    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the players cardinal direction, and the identifier of the block
    const direction = origin.getCardinalDirection();
    const identifier = this.block.identifier;

    // Trapdoors number the way they face from their hinge out, as stairs number the ways they climb,
    // and hinge on the side away from the player
    if (identifier.endsWith("trapdoor"))
      return this.setDirection(OppositeDirections[direction]);

    // Beds point from their foot to their head, the way the player faces
    if (identifier === BlockIdentifier.Bed)
      return this.setDirection(LegacyDirections[direction]);

    // Some blocks face out of the side of the block they are placed against
    if (SideFacingBlocks.has(identifier)) {
      // Get the direction of the side the block was placed against, if it is a side
      const side =
        clickedFace === undefined ? undefined : FaceDirections[clickedFace];

      return this.setDirection(
        LegacyDirections[side ?? OppositeDirections[direction]]
      );
    }

    // Other blocks turn their front to the player
    return this.setDirection(LegacyDirections[OppositeDirections[direction]]);
  }

  /**
   * Gets the current direction that the block is facing.
   * @returns The direction relative to the block.
   */
  public getDirection(): number {
    // Get the state of the block
    const state = this.block.getState<number>(this.state as string);

    // Return the direction of the block
    return state;
  }

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public setDirection(direction: number): void {
    // Set the direction of the block
    this.block.setState(this.state as string, direction);
  }
}

export { BlockDirectionTrait };
