import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

class BlockWeirdoDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "weirdo_direction";

  public onPlace({ origin }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin) return;

    // Get the player's cardinal direction
    const direction = origin.getCardinalDirection();

    // Set the direction of the block
    this.setDirection(direction);
  }

  public getDirection(): CardinalDirection {
    // Get the state of the block
    const state = this.block.permutation.state as unknown &
      Record<"weirdo_direction", CardinalDirection>;

    // Get the direction of the block
    return state.weirdo_direction;
  }

  public setDirection(direction: CardinalDirection): void {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      weirdo_direction: direction
    };

    // Get the permutation of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { BlockWeirdoDirectionTrait };
