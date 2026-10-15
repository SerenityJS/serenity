import {
  BlockIdentifier,
  CardinalDirection,
  FacingDirection
} from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

import type { Player } from "../../entity";

/**
 * The directions opposite each direction.
 */
const OppositeDirections: Record<FacingDirection, FacingDirection> = {
  [FacingDirection.Down]: FacingDirection.Up,
  [FacingDirection.Up]: FacingDirection.Down,
  [FacingDirection.North]: FacingDirection.South,
  [FacingDirection.South]: FacingDirection.North,
  [FacingDirection.West]: FacingDirection.East,
  [FacingDirection.East]: FacingDirection.West
};

/**
 * The blocks that face the player and can face up or down, but store the four sides around reversed.
 */
const ReversedFacingBlocks = new Set<string>([
  BlockIdentifier.Piston,
  BlockIdentifier.StickyPiston
]);

/**
 * The blocks that face the player and can face up or down, rather than only to the sides.
 */
const VerticalFacingBlocks = new Set<string>([
  BlockIdentifier.Dispenser,
  BlockIdentifier.Dropper,
  BlockIdentifier.CommandBlock,
  BlockIdentifier.RepeatingCommandBlock,
  BlockIdentifier.ChainCommandBlock,
  BlockIdentifier.Barrel,
  BlockIdentifier.Jigsaw
]);

class BlockFacingDirection extends BlockDirectionTrait {
  public static readonly state = "facing_direction";

  public onPlace({ origin, clickedFace }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the identifier of the block
    const identifier = this.block.identifier;

    // Stems face the fruit they grow, so they face nothing when placed
    if (identifier.endsWith("_stem")) return;

    // Hanging signs are turned by the sign trait
    if (identifier.endsWith("_hanging_sign")) return;

    // Pistons face the player, but keep the four sides around reversed, so the number for north means south
    if (ReversedFacingBlocks.has(identifier)) {
      const facing = this.getPlayerFacing(origin, true);
      return this.setDirection(this.reverseSides(facing));
    }

    // Check if the block was placed against a face of another block
    if (clickedFace !== undefined) {
      // The face, as the direction pointing away from the block placed against
      const face = clickedFace as number as FacingDirection;
      const vertical =
        face === FacingDirection.Up || face === FacingDirection.Down;

      // End rods point away from the block they are placed against, keeping the four sides around reversed
      if (identifier === BlockIdentifier.EndRod)
        return this.setDirection(this.reverseSides(face));

      // Blocks attached to a block face away from it
      if (this.isAttachedToFace(identifier)) {
        // Heads are not placed under blocks, so they stand up instead
        if (this.isHead(identifier) && face === FacingDirection.Down)
          return this.setDirection(FacingDirection.Up);

        // Blocks mounted on walls are only attached to the sides of blocks
        if (!vertical || !this.isWallMounted(identifier))
          return this.setDirection(face);
      }

      // Hoppers point into the block they are placed against, or down
      if (identifier === BlockIdentifier.Hopper) {
        return this.setDirection(
          vertical ? FacingDirection.Down : OppositeDirections[face]
        );
      }
    }

    // Other blocks face the player
    const vertical = VerticalFacingBlocks.has(identifier);
    return this.setDirection(this.getPlayerFacing(origin, vertical));
  }

  /**
   * Whether a block is attached to the face of the block it is placed against, facing away from it.
   * @param identifier The identifier of the block.
   */
  protected isAttachedToFace(identifier: string): boolean {
    return (
      identifier.endsWith("_button") ||
      identifier.endsWith("lightning_rod") ||
      identifier === BlockIdentifier.EndRod ||
      identifier === BlockIdentifier.Frame ||
      identifier === BlockIdentifier.GlowFrame ||
      this.isHead(identifier) ||
      this.isWallMounted(identifier)
    );
  }

  /**
   * Whether a block is only mounted on the sides of blocks.
   * @param identifier The identifier of the block.
   */
  protected isWallMounted(identifier: string): boolean {
    return (
      identifier.endsWith("wall_sign") ||
      identifier === BlockIdentifier.Ladder ||
      identifier === BlockIdentifier.WallBanner
    );
  }

  /**
   * Whether a block is a mob head or skull.
   * @param identifier The identifier of the block.
   */
  protected isHead(identifier: string): boolean {
    return identifier.endsWith("_head") || identifier.endsWith("_skull");
  }

  /**
   * Gets the direction a block placed by a player faces, which is towards the player.
   * A block that can face up or down does so when the player is right beside it,
   * with their eyes well above it or below it, as vanilla does.
   * @param player The player that placed the block.
   * @param vertical Whether the block can face up or down.
   */
  protected getPlayerFacing(
    player: Player,
    vertical: boolean
  ): FacingDirection {
    // Check if the player is right beside the block
    const { x, y, z } = this.block.position;
    const position = player.position;
    if (
      vertical &&
      Math.abs(Math.floor(position.x) - x) < 2 &&
      Math.abs(Math.floor(position.z) - z) < 2
    ) {
      // Get the height of the player's eyes
      const eyes = position.y + player.getCollisionHeight();

      // A player well above the block places it facing up, and below it, facing down
      if (eyes - y > 2) return FacingDirection.Up;
      if (y - eyes > 0) return FacingDirection.Down;
    }

    // Otherwise, the block faces the opposite way to the player
    switch (player.getCardinalDirection()) {
      case CardinalDirection.North:
        return FacingDirection.South;
      case CardinalDirection.South:
        return FacingDirection.North;
      case CardinalDirection.East:
        return FacingDirection.West;
      case CardinalDirection.West:
        return FacingDirection.East;
    }
  }

  /**
   * Reverses a direction if it is one of the four sides around, as pistons and end rods store them.
   * @param direction The direction to reverse.
   */
  protected reverseSides(direction: FacingDirection): FacingDirection {
    return direction === FacingDirection.Up ||
      direction === FacingDirection.Down
      ? direction
      : OppositeDirections[direction];
  }

  public getDirection(): FacingDirection {
    // Get the state of the block
    const state = this.block.getState<FacingDirection>(this.state as string);

    // Return the direction of the block
    return state;
  }

  public setDirection(direction: FacingDirection): void {
    // Set the direction of the block
    this.block.setState(this.state as string, direction);
  }
}

export { BlockFacingDirection };
