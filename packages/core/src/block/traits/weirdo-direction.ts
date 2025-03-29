import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

class BlockWeirdoDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "weirdo_direction";

  public async onPlace({ origin }: BlockPlacementOptions): Promise<void> {
    // Check if the origin is a player
    if (!origin) return;

    // Get the player's cardinal direction
    const direction = origin.getCardinalDirection();

    // Set the direction of the block
    return this.setDirection(direction);
  }

  public getDirection(): CardinalDirection {
    // Get the state of the block
    return this.block.getState<CardinalDirection>(this.state as string);
  }

  public async setDirection(direction: CardinalDirection): Promise<void> {
    // Set the direction of the block
    return this.block.setState(this.state as string, direction);
  }
}

export { BlockWeirdoDirectionTrait };
