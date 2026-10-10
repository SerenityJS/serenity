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
 * The blocks that face the player and can face up or down, rather than only to the sides.
 */
const VerticalFacingBlocks = new Set<string>([
  BlockIdentifier.Piston,
  BlockIdentifier.StickyPiston,
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

    // Check if the block was placed against a face of another block
    if (clickedFace !== undefined) {
      // The face, as the direction pointing away from the block placed against
      const face = clickedFace as number as FacingDirection;
      const vertical =
        face === FacingDirection.Up || face === FacingDirection.Down;

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
   * The block faces up or down when the player looks more up or down than to the side.
   * @param player The player that placed the block.
   * @param vertical Whether the block can face up or down.
   */
  protected getPlayerFacing(
    player: Player,
    vertical: boolean
  ): FacingDirection {
    // Check if the player looks more up or down than to the side
    if (vertical) {
      const pitch = (player.rotation.pitch * Math.PI) / 180;
      const yaw = (player.rotation.yaw * Math.PI) / 180;

      // The largest horizontal part of the direction the player looks in
      const horizontal =
        Math.cos(pitch) *
        Math.max(Math.abs(Math.sin(yaw)), Math.abs(Math.cos(yaw)));

      // A player looking down places the block facing up, and looking up, facing down
      if (Math.abs(Math.sin(pitch)) > horizontal)
        return pitch > 0 ? FacingDirection.Up : FacingDirection.Down;
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
