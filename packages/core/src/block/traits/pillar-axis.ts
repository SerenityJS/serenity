import { BlockPlacementOptions, BlockTrait } from "../..";

class BlockPillarAxisTrait extends BlockTrait {
  public static readonly state = "pillar_axis";
  public static readonly identifier = "pillar_axis";

  public async onPlace({
    origin,
    clickedPosition
  }: BlockPlacementOptions): Promise<void> {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer() || !clickedPosition) return;

    // Set the direction of the block
    if (clickedPosition.x == 1 || clickedPosition.x == 0)
      return this.setDirection("x");
    else if (clickedPosition.y == 1 || clickedPosition.y == 0)
      return this.setDirection("y");
    else if (clickedPosition.z == 1 || clickedPosition.z == 0)
      return this.setDirection("z");
  }

  public getDirection(): "x" | "y" | "z" {
    // Get the state of the block
    const state = this.block.permutation.state as unknown &
      Record<"pillar_axis", "x" | "y" | "z">;

    // Get the direction of the block
    return state.pillar_axis;
  }

  public async setDirection(direction: "x" | "y" | "z"): Promise<void> {
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
    if (permutation) await this.block.setPermutation(permutation);
  }
}

export { BlockPillarAxisTrait };
