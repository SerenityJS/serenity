import { Vector3f } from "@serenityjs/protocol";

import { Player } from "../../entity";

import { BlockTrait } from "./trait";

class VerticalHalfTrait extends BlockTrait {
  public static readonly identifier = "vertical_half";
  public static readonly state = "minecraft:vertical_half";

  public onPlace(_player: Player, clickPosition: Vector3f): void {
    // Check if the click position is above the center of the block
    if (clickPosition.y > 0.5 && clickPosition.y < 0.99)
      this.setVerticalHalf(true);
  }

  public onInteract(player: Player): boolean {
    // Get the players held item
    const itemStack = player.getHeldItem();

    // Check if the stack has a block type
    if (!itemStack || !itemStack.type.block) return true;

    // Get the block type of the item
    const blockType = itemStack.type.block;

    // Check if the block type is equal to the interacting block
    if (blockType !== this.block.type) return true;

    return false;
  }

  public setVerticalHalf(topBit: boolean): void {
    // Get the block type
    const type = this.block.type;

    // Get the state of the block
    const state = this.block.permutation.state;

    // Create the state of the block
    const newState = {
      ...state,
      "minecraft:vertical_half": topBit ? "top" : "bottom"
    };

    // Set the direction of the block
    const permutation = type.getPermutation(newState);

    // Set the permutation of the block
    if (permutation) this.block.setPermutation(permutation);
  }
}

export { VerticalHalfTrait };
