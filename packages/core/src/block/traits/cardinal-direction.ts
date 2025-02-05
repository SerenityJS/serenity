import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

class BlockCardinalDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "minecraft:cardinal_direction";

  public onPlace({ origin }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the player's cardinal direction
    const direction = origin.getCardinalDirection();

    // Set the direction of the block to the opposite of the player's direction
    switch (direction) {
      case CardinalDirection.North:
        this.setDirection(CardinalDirection.South);
        break;
      case CardinalDirection.South:
        this.setDirection(CardinalDirection.North);
        break;
      case CardinalDirection.East:
        this.setDirection(CardinalDirection.West);
        break;
      case CardinalDirection.West:
        this.setDirection(CardinalDirection.East);
        break;
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

  public setDirection(direction: CardinalDirection): void {
    // Transform the cardinal direction to a string
    const value = CardinalDirection[direction].toLowerCase();

    // Set the direction of the block
    this.block.setState(this.state as string, value);
  }
}

export { BlockCardinalDirectionTrait };
