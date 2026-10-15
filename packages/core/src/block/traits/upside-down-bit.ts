import { BlockFace } from "@serenityjs/protocol";

import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

class BlockUpsideDownBitTrait extends BlockTrait {
  public static readonly identifier = "upside_down_bit";
  public static readonly state = "upside_down_bit";

  public onPlace({
    origin,
    clickedFace,
    clickedPosition
  }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // The block takes the top half of its space when placed against the underside of a block,
    // or the top half of the side of a block
    const upsideDown =
      clickedFace === BlockFace.Bottom ||
      (clickedFace !== BlockFace.Top && clickedPosition.y > 0.5);

    // Set the direction of the block
    return this.setUpsideDown(upsideDown);
  }

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public setUpsideDown(upsideDown: boolean): void {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      upside_down_bit: upsideDown
    };

    // Set the direction of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { BlockUpsideDownBitTrait };
