import { BlockInteractionOptions, BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

class VerticalHalfTrait extends BlockTrait {
  public static readonly identifier = "vertical_half";
  public static readonly state = "minecraft:vertical_half";

  public onPlace({ origin, clickedPosition }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // Check if the click position is above the center of the block
    if (clickedPosition.y > 0.5 && clickedPosition.y < 0.99)
      this.setVerticalHalf(true);
  }

  public onInteract({ origin }: BlockInteractionOptions): boolean {
    // Check if the origin is a player
    if (!origin) return false;

    // Get the players held item
    const itemStack = origin.getHeldItem();

    // Check if the stack has a block type
    if (!itemStack || !itemStack.type.blockType) return true;

    // Get the block type of the item
    const blockType = itemStack.type.blockType;

    // Check if the block type is equal to the interacting block
    if (blockType !== this.block.type) return true;

    return false;
  }

  public setVerticalHalf(topBit: boolean): void {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      "minecraft:vertical_half": topBit ? "top" : "bottom"
    };

    // Set the direction of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { VerticalHalfTrait };
