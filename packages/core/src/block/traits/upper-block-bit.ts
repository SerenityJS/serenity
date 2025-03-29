import { BlockIdentifier } from "../../enums";
import { BlockInteractionOptions } from "../../types";

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
   * @deprecated Use `setIsUpperBlock` instead. Errors will be lost if you use this.
   */
  public set isUpperBlock(value: boolean) {
    void this.setIsUpperBlock(value);
  }

  /**
   * Set whether the block is an upper block
   */
  public async setIsUpperBlock(value: boolean): Promise<void> {
    // Get the state of the block
    const state = this.block.permutation.state;

    // Get the permutation of the block
    const permutation = this.block.type.getPermutation({
      ...state,
      upper_block_bit: value
    });

    // Set the state of the block
    return this.block.setPermutation(permutation);
  }

  public async onInteract(
    options: BlockInteractionOptions
  ): Promise<boolean | void> {
    // Check if the block is not the upper block
    if (!this.isUpperBlock) return;

    // Get the below block
    const below = await this.block.below();

    // Interact with the below block
    return (await below.interact(options)).cancel;
  }

  public async onPlace(): Promise<void> {
    // Get the state of the block
    const state = this.block.permutation.state as { upper_block_bit: boolean };

    // Check if the block is the upper block
    if (state.upper_block_bit) return;

    // Get the above block
    const above = await this.block.above();

    // Get the permutation of the block
    const permutation = this.block.type.getPermutation({
      ...above.permutation.state,
      upper_block_bit: true
    });

    // Set the state of the block
    return above.setPermutation(permutation);
  }

  public async onBreak(): Promise<void> {
    // Check if the block is the upper block
    if (this.isUpperBlock) {
      // Get the below block
      const below = await this.block.below();

      // Break the below block
      below.identifier = BlockIdentifier.Air;
    } else {
      // Get the above block
      const above = await this.block.above();

      // Break the above block
      above.identifier = BlockIdentifier.Air;
    }
  }
}

export { BlockUpperTrait };
