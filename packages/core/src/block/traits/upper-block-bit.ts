import { Vector3f, BlockFace } from "@serenityjs/protocol";

import { Player } from "../../entity";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockUpperTrait extends BlockTrait {
  public static readonly identifier = "upper-block";
  public static readonly state = "upper_block_bit";

  /**
   * Whether the block is an upper block
   */
  public get isUpperBlock(): boolean {
    // Get the state of the block
    const state = this.block.permutation.state as { upper_block_bit: boolean };

    // Return the state of the block
    return state?.upper_block_bit ?? false;
  }

  /**
   * Set whether the block is an upper block
   */
  public set isUpperBlock(value: boolean) {
    // Get the state of the block
    const state = this.block.permutation.state;

    // Get the permutation of the block
    const permutation = this.block.type.getPermutation({
      ...state,
      upper_block_bit: value
    });

    // Set the state of the block
    this.block.setPermutation(permutation);
  }

  public onInteract(
    player: Player,
    clickPosition: Vector3f,
    clickFace: BlockFace
  ): boolean | void {
    // Check if the block is not the upper block
    if (!this.isUpperBlock) return;

    // Get the below block
    const below = this.block.below();

    // Interact with the below block
    return below.interact(player, clickPosition, clickFace);
  }

  public onPlace(): void {
    // Get the state of the block
    const state = this.block.permutation.state as { upper_block_bit: boolean };

    // Check if the block is the upper block
    if (state.upper_block_bit) return;

    // Get the above block
    const above = this.block.above();

    // Get the permutation of the block
    const permutation = this.block.type.getPermutation({
      ...above.permutation.state,
      upper_block_bit: true
    });

    // Set the state of the block
    above.setPermutation(permutation);
  }

  public onBreak(): void {
    // Check if the block is the upper block
    if (this.isUpperBlock) {
      // Get the below block
      const below = this.block.below();

      // Break the below block
      below.identifier = BlockIdentifier.Air;
    } else {
      // Get the above block
      const above = this.block.above();

      // Break the above block
      above.identifier = BlockIdentifier.Air;
    }
  }
}

export { BlockUpperTrait };
