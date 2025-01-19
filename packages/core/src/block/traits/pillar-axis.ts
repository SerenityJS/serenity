import { Vector3f } from "@serenityjs/protocol";

import { BlockTrait } from "../..";
import { Player } from "../../entity";

class BlockPillarAxisTrait extends BlockTrait {
  public static readonly state = "pillar_axis";
  public static readonly identifier = "pillar_axis";

  public onPlace(_: Player, clickPosition: Vector3f): void {
    // Set the direction of the block
    if (clickPosition.x == 1 || clickPosition.x == 0) {
      this.setDirection("x");
    }
    if (clickPosition.y == 1 || clickPosition.y == 0) {
      this.setDirection("y");
    }
    if (clickPosition.z == 1 || clickPosition.z == 0) {
      this.setDirection("z");
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
