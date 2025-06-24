import { BlockPlacementOptions } from "../..";
import { CardinalDirection } from "../../enums";

import { BlockTrait } from "./trait";

class BlockDirectionTrait extends BlockTrait {
  public static readonly identifier = "direction";
  public static readonly state: string = "direction";

  public onPlace(options: BlockPlacementOptions): boolean | void {
    // Get the origin of the block placement
    const { origin } = options;

    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the players cardinal direction
    const direction = origin.getCardinalDirection();

    // Switch the direction of the block based on the player's direction
    switch (direction) {
      case CardinalDirection.North: {
        return this.setDirection(2);
      }

      case CardinalDirection.South: {
        return this.setDirection(0);
      }

      case CardinalDirection.East: {
        return this.setDirection(3);
      }

      case CardinalDirection.West: {
        return this.setDirection(1);
      }
    }
  }

  /**
   * Gets the current direction that the block is facing.
   * @returns The direction relative to the block.
   */
  public getDirection(): number {
    // Get the state of the block
    const state = this.block.getState<number>(this.state as string);

    // Return the direction of the block
    return state;
  }

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public setDirection(direction: number): void {
    // Set the direction of the block
    this.block.setState(this.state as string, direction);
  }
}

export { BlockDirectionTrait };
