import { BlockIdentifier } from "../../enums";
import { BlockInteractionOptions, BlockPlacementOptions } from "../../types";

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

  /**
   * Whether the block is a door, whose halves the door and open bit traits handle.
   */
  public get isDoor(): boolean {
    return this.block.identifier.endsWith("_door");
  }

  public onInteract(options: BlockInteractionOptions): boolean | void {
    // Check if the block is not the upper block, or is a door, which opens both halves itself
    if (!this.isUpperBlock || this.isDoor) return;

    // Get the below block
    const below = this.block.below();

    // Interact with the below block
    return below.interact(options).cancel;
  }

  public onPlace({ cancel }: BlockPlacementOptions): boolean | void {
    // Check if the placement was cancelled, or if the block is a door, which the door trait places
    if (cancel || this.isDoor) return;

    // Get the state of the block
    const state = this.block.permutation.state as { upper_block_bit: boolean };

    // Check if the block is the upper block
    if (state.upper_block_bit) return;

    // Get the above block, which needs to be free for the upper half
    const above = this.block.above();
    if (!above.isReplaceable) return false;

    // Get the permutation of the upper half, in the same state as the lower half
    const permutation = this.block.type.getPermutation({
      ...state,
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

      // Break the below block, if it is the other half
      if (below.identifier === this.block.identifier)
        below.identifier = BlockIdentifier.Air;
    } else {
      // Get the above block
      const above = this.block.above();

      // Break the above block, if it is the other half
      if (above.identifier === this.block.identifier)
        above.identifier = BlockIdentifier.Air;
    }
  }
}

export { BlockUpperTrait };
