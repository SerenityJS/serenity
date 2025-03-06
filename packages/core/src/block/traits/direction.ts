import { CardinalDirection } from "../../enums";

import { BlockTrait } from "./trait";

class BlockDirectionTrait extends BlockTrait {
  public static readonly identifier = "direction";

  /**
   * Gets the current direction that the block is facing.
   * @returns The direction relative to the block.
   */
  public getDirection(): number {
    return CardinalDirection.North; // Default to north
  }

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public setDirection(direction: number): void {
    return void direction;
  }
}

export { BlockDirectionTrait };
