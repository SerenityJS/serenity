import { Player } from "../../entity";
import { CardinalDirection } from "../../enums";

import { BlockTrait } from "./trait";

class BlockCardinalDirectionTrait extends BlockTrait {
  public static readonly identifier = "minecraft:cardinal_direction";

  public onPlace(player: Player): void {
    // Get the player's cardinal direction
    const direction = player.getCardinalDirection();

    console.log(direction);

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

  /**
   * Sets the direction of the block.
   * @param direction The direction to set.
   */
  public setDirection(direction: CardinalDirection): void {
    // Get the block type
    const type = this.block.getType();

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      "minecraft:cardinal_direction": CardinalDirection[direction].toLowerCase()
    };

    // Get the permutation of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { BlockCardinalDirectionTrait };
