import { BlockPlacementOptions, BlockTrait } from "../..";

class BlockPillarAxisTrait extends BlockTrait {
  public static readonly state = "pillar_axis";
  public static readonly identifier = "pillar_axis";

  public onPlace({ origin, clickedPosition }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // Set the direction of the block
    if (clickedPosition.x == 1 || clickedPosition.x == 0)
      this.setDirection("x");
    else if (clickedPosition.y == 1 || clickedPosition.y == 0)
      this.setDirection("y");
    else if (clickedPosition.z == 1 || clickedPosition.z == 0)
      this.setDirection("z");
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
