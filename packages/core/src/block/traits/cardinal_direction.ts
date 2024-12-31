import { Player } from "../../entity";
import { CardinalDirection } from "../../enums";

import { BlockDirectionTrait } from "./direction";

class BlockCardinalDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "minecraft:cardinal_direction";

  public onPlace(player?: Player): void {
    if (!player) return;
    // Get the player's cardinal direction
    const direction = player.getCardinalDirection();

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

  public setDirection(direction: CardinalDirection): void {
    // Get the block type
    const type = this.block.type;

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

  public getDirection(): CardinalDirection {
    // Get the state of the block
    const state = this.block.permutation.state as unknown &
      Record<"minecraft:cardinal_direction", string>;

    // Get the direction of the block
    const rawDirection = state["minecraft:cardinal_direction"];

    // Convert the direction to a cardinal direction
    const direction =
      rawDirection.charAt(0).toUpperCase() + rawDirection.substring(1);

    // Return the cardinal direction
    return CardinalDirection[direction as keyof typeof CardinalDirection];
  }
}

export { BlockCardinalDirectionTrait };
