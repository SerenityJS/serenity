import { BlockFace } from "@serenityjs/protocol";

import { BlockPlacementOptions, BlockTrait } from "../..";

class BlockPillarAxisTrait extends BlockTrait {
  public static readonly state = "pillar_axis";
  public static readonly identifier = "pillar_axis";

  public onPlace({ origin, clickedFace }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || clickedFace === undefined) return;

    // The block lies along the axis of the face it was placed against
    switch (clickedFace) {
      case BlockFace.Top:
      case BlockFace.Bottom:
        return this.setDirection("y");

      case BlockFace.North:
      case BlockFace.South:
        return this.setDirection("z");

      case BlockFace.West:
      case BlockFace.East:
        return this.setDirection("x");
    }
  }

  public getDirection(): "x" | "y" | "z" {
    // Get the state of the block
    const state = this.block.permutation.state as unknown &
      Record<"pillar_axis", "x" | "y" | "z">;

    // Get the direction of the block
    return state.pillar_axis;
  }

  public setDirection(direction: "x" | "y" | "z"): void {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      pillar_axis: direction
    };

    // Get the permutation of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { BlockPillarAxisTrait };
