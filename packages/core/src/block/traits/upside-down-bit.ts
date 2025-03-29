import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

class BlockUpsideDownBitTrait extends BlockTrait {
  public static readonly identifier = "upside_down_bit";
  public static readonly state = "upside_down_bit";

  public async onPlace({
    origin,
    clickedPosition
  }: BlockPlacementOptions): Promise<void> {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // Check if the click position is on the top face of the block
    if (clickedPosition.y === 1) return this.setUpsideDown(false);

    // Check if the click position is on the bottom face of
    if (clickedPosition.y === 0) return this.setUpsideDown(true);

    // Check if the block needs to be upside down
    const upsideDown = clickedPosition.y > 0.5;

    // Set the direction of the block
    return this.setUpsideDown(upsideDown);
  }

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public async setUpsideDown(upsideDown: boolean): Promise<void> {
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
    if (permutation) await this.block.setPermutation(permutation);
  }
}

export { BlockUpsideDownBitTrait };
