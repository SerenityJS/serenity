import { CardinalDirection, FacingDirection } from "../../enums";
import { BlockPlacementOptions } from "../../types";

import { BlockDirectionTrait } from "./direction";

class BlockFacingDirection extends BlockDirectionTrait {
  public static readonly state = "facing_direction";

  public async onPlace({ origin }: BlockPlacementOptions): Promise<void> {
    // Check if the origin is a player
    if (!origin || !origin.isPlayer()) return;

    // Get the player's pitch
    const pitch = Math.ceil(origin.rotation.pitch);

    // Check if the player is looking up or down
    if (pitch === 90) return this.setDirection(FacingDirection.Up);
    else if (pitch === -90) return this.setDirection(FacingDirection.Down);

    // Get the player's cardinal direction
    const direction = origin.getCardinalDirection();

    // Switch the direction of the block based on the player's direction
    switch (direction) {
      case CardinalDirection.North: {
        return this.setDirection(FacingDirection.South);
      }

      case CardinalDirection.South: {
        return this.setDirection(FacingDirection.North);
      }

      case CardinalDirection.East: {
        return this.setDirection(FacingDirection.West);
      }

      case CardinalDirection.West: {
        return this.setDirection(FacingDirection.East);
      }
    }
  }

  public getDirection(): FacingDirection {
    // Get the state of the block
    const state = this.block.getState<FacingDirection>(this.state as string);

    // Return the direction of the block
    return state;
  }

  public async setDirection(direction: FacingDirection): Promise<void> {
    // Set the direction of the block
    return this.block.setState(this.state as string, direction);
  }
}

export { BlockFacingDirection };
