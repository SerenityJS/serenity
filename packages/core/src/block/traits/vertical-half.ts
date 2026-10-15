import { BlockFace } from "@serenityjs/protocol";

import { BlockPlacementOptions } from "../../types";

import { BlockTrait } from "./trait";

class VerticalHalfTrait extends BlockTrait {
  public static readonly identifier = "vertical_half";
  public static readonly state = "minecraft:vertical_half";

  public onPlace({
    origin,
    clickedFace,
    clickedPosition
  }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // Double slabs fill their whole space, keeping the half of the slab they were made from
    if (this.block.identifier.includes("double")) return;

    // The slab takes the top half of its space when placed against the underside of a block,
    // or the top half of the side of a block
    const top =
      clickedFace === BlockFace.Bottom ||
      (clickedFace !== BlockFace.Top && clickedPosition.y > 0.5);

    // Set the half of the slab
    this.setVerticalHalf(top);
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
