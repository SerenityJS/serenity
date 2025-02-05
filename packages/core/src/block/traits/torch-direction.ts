import { BlockFace } from "@serenityjs/protocol";

import { BlockPlacementOptions } from "../../types";
import { TorchDirection } from "../../enums";
import { Block } from "../block";

import { BlockTrait } from "./trait";

class BlockTorchDirectionTrait extends BlockTrait {
  public static readonly identifier = "torch_direction";
  public static readonly state = "torch_facing_direction";

  public onPlace({ origin, clickedFace }: BlockPlacementOptions): void {
    // Check if there is an origin
    if (!origin) return;

    // Switch the direction of the torch based on the clicked face
    switch (clickedFace) {
      case BlockFace.Top: {
        this.setDirection(TorchDirection.Top);
        break;
      }

      case BlockFace.North: {
        // Get the south block
        const south = this.block.south();

        // Check if the south block is solid
        // If it is, set the direction to south
        // If it isn't, set the direction to top
        if (south && south.isSolid)
          return this.setDirection(TorchDirection.South);
        else return this.setDirection(TorchDirection.Top);
      }

      case BlockFace.South: {
        // Get the north block
        const north = this.block.north();

        // Check if the north block is solid
        // If it is, set the direction to north
        // If it isn't, set the direction to top
        if (north && north.isSolid)
          return this.setDirection(TorchDirection.North);
        else return this.setDirection(TorchDirection.Top);
      }

      case BlockFace.East: {
        // Get the west block
        const west = this.block.west();

        // Check if the west block is solid
        // If it is, set the direction to west
        // If it isn't, set the direction to top
        if (west && west.isSolid) return this.setDirection(TorchDirection.West);
        else return this.setDirection(TorchDirection.Top);
      }

      case BlockFace.West: {
        // Get the east block
        const east = this.block.east();

        // Check if the east block is solid
        // If it is, set the direction to east
        // If it isn't, set the direction to top
        if (east && east.isSolid) return this.setDirection(TorchDirection.East);
        else return this.setDirection(TorchDirection.Top);
      }

      // If the torch is placed on the bottom face, determine the direction based on the surrounding blocks
      case BlockFace.Bottom: {
        // Check if the north block is solid
        const north = this.block.north();
        if (north && north.isSolid)
          return this.setDirection(TorchDirection.North);

        // Cjeck if the south block is solid
        const south = this.block.south();
        if (south && south.isSolid)
          return this.setDirection(TorchDirection.South);

        // Check if the east block is solid
        const east = this.block.east();
        if (east && east.isSolid) return this.setDirection(TorchDirection.East);

        // Check if the west block is solid
        const west = this.block.west();
        if (west && west.isSolid) return this.setDirection(TorchDirection.West);

        // If no solid blocks are found, default to the top direction
        return this.setDirection(TorchDirection.Top);
      }

      default: {
        this.setDirection(TorchDirection.Top);
        break;
      }
    }
  }

  public onUpdate(source?: Block): void {
    // Check if there is a source block
    if (!source || source === this.block) return;

    // Switch the direction of the torch based on the source block
    // We want to make sure the block is still supported by a solid block
    switch (this.getDirection()) {
      case TorchDirection.Top: {
        // Get the block below the torch
        const below = this.block.below();

        // Check if the block below is solid
        if (below && !below.isSolid)
          return void this.block.destroy({ dropLoot: true });
        else break;
      }

      case TorchDirection.North: {
        // Get the north block
        const north = this.block.north();

        // Check if the north block is solid
        if (north && !north.isSolid)
          return void this.block.destroy({ dropLoot: true });
        else break;
      }

      case TorchDirection.South: {
        // Get the south block
        const south = this.block.south();

        // Check if the south block is solid
        if (south && !south.isSolid)
          return void this.block.destroy({ dropLoot: true });
        else break;
      }

      case TorchDirection.East: {
        // Get the east block
        const east = this.block.east();

        // Check if the east block is solid
        if (east && !east.isSolid)
          return void this.block.destroy({ dropLoot: true });
        else break;
      }

      case TorchDirection.West: {
        // Get the west block
        const west = this.block.west();

        // Check if the west block is solid
        if (west && !west.isSolid)
          return void this.block.destroy({ dropLoot: true });
        else break;
      }
    }
  }

  public getDirection(): TorchDirection {
    return this.block.getState<TorchDirection>(this.state as string);
  }

  public setDirection(direction: TorchDirection): void {
    this.block.setState(this.state as string, direction);
  }
}

export { BlockTorchDirectionTrait };
