import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

class BlockCardinalDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "minecraft:cardinal_direction";

  public async onPlace({ origin }: BlockPlacementOptions): Promise<void> {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the player's cardinal direction
    const direction = origin.getCardinalDirection();

    // Set the direction of the block to the opposite of the player's direction
    switch (direction) {
      case CardinalDirection.North:
        return this.setDirection(CardinalDirection.South);
      case CardinalDirection.South:
        return this.setDirection(CardinalDirection.North);
      case CardinalDirection.East:
        return this.setDirection(CardinalDirection.West);
      case CardinalDirection.West:
        return this.setDirection(CardinalDirection.East);
    }
  }

  public getDirection(): CardinalDirection {
    // Get the state of the block
    const state = this.block.getState<string>(this.state as string);

    // Convert the direction to a cardinal direction
    const direction = state.charAt(0).toUpperCase() + state.substring(1);

    // Return the cardinal direction
    return CardinalDirection[direction as keyof typeof CardinalDirection];
  }

  public async setDirection(direction: CardinalDirection): Promise<void> {
    // Transform the cardinal direction to a string
    const value = CardinalDirection[direction].toLowerCase();

    // Set the direction of the block
    await this.block.setState(this.state as string, value);
  }
}

export { BlockCardinalDirectionTrait };
