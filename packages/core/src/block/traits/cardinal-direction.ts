import { CardinalDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

/**
 * The directions opposite each direction.
 */
const OppositeDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.North,
  [CardinalDirection.East]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.East
};

/**
 * The directions a quarter turn clockwise from each direction, seen from above.
 */
const ClockwiseDirections: Record<CardinalDirection, CardinalDirection> = {
  [CardinalDirection.North]: CardinalDirection.East,
  [CardinalDirection.East]: CardinalDirection.South,
  [CardinalDirection.South]: CardinalDirection.West,
  [CardinalDirection.West]: CardinalDirection.North
};

class BlockCardinalDirectionTrait extends BlockDirectionTrait {
  public static readonly state = "minecraft:cardinal_direction";

  public onPlace({ origin }: BlockPlacementOptions): void {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the player's cardinal direction, and the identifier of the block
    const direction = origin.getCardinalDirection();
    const identifier = this.block.identifier;

    // Doors name the side a quarter turn clockwise from the way the player faces
    if (identifier.endsWith("_door"))
      return this.setDirection(ClockwiseDirections[direction]);

    // Fence gates face the way the player does
    if (identifier.endsWith("fence_gate")) return this.setDirection(direction);

    // Anvils lie across the way the player faces
    if (identifier.endsWith("anvil"))
      return this.setDirection(
        OppositeDirections[ClockwiseDirections[direction]]
      );

    // Other blocks turn their front to the player
    this.setDirection(OppositeDirections[direction]);
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
