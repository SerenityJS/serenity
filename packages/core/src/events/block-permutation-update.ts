import { BlockPosition } from "@serenityjs/protocol";

import { Block, BlockPermutation } from "../block";
import { WorldEvent } from "../enums";
import { Dimension } from "../world";

import { EventSignal } from "./event-signal";

class BlockPermutationUpdateSignal extends EventSignal {
  public static readonly identifier = WorldEvent.BlockPermutationUpdate;

  /**
   * The dimension the event occurred in.
   */
  public readonly dimension: Dimension;

  /**
   * The permutation that is being set to the block.
   */
  public readonly permutation: BlockPermutation;

  /**
   * The position of the block.
   */
  public readonly position: BlockPosition;

  /**
   * Creates a new block permutation update signal.
   * @param dimension The dimension the event occurred in.
   * @param position The position of the block.
   * @param permutation The permutation that is being set to the block.
   */
  public constructor(
    dimension: Dimension,
    position: BlockPosition,
    permutation: BlockPermutation
  ) {
    super(dimension.world);
    this.dimension = dimension;
    this.position = position;
    this.permutation = permutation;
  }

  /**
   * The block that was updated.
   */
  public get block(): Block {
    return this.dimension.getBlock(this.position);
  }
}

export { BlockPermutationUpdateSignal };
