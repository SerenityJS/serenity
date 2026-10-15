import { BlockFace } from "@serenityjs/protocol";

import { BlockType } from "../identity";
import { Block } from "../block";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockSupportTrait extends BlockTrait {
  public static readonly identifier = "support";
  public static tag = "plant";
  public static types = ["minecraft:short_grass"];

  /**
   * The block type that provides support for this block.
   * If null, any block type can provide support.
   */
  private supportBlockType: BlockType | null = null;

  /**
   * The direction in which the block is supported.
   */
  private supportDirections: Array<BlockFace> = [];

  public constructor(block: Block) {
    super(block);

    // By default, support is provided from below
    this.supportDirections.push(BlockFace.Bottom);
  }

  public onUpdate(): void {
    // Break the block on the next tick, dropping it, if it is not supported
    if (!this.isSupported()) this.breakNextTick(() => this.isSupported());
  }

  /**
   * Whether the block is supported from any of its support directions.
   */
  public isSupported(): boolean {
    // Check if the block is supported from any of the defined directions
    for (const direction of this.supportDirections) {
      // Get the block in the support direction
      const supportBlock = this.block.face(direction);

      // The upper half of a plant two blocks tall is supported by its lower half
      if (supportBlock.type === this.block.type) return true;

      // Check if the support block is of the correct type
      if (this.supportBlockType !== null) {
        if (supportBlock.type === this.supportBlockType) return true;
      }

      // If no specific support block type is defined, any solid block or farmland can provide support
      else if (
        supportBlock.isSolid ||
        supportBlock.identifier === BlockIdentifier.Farmland
      )
        return true;
    }

    // The block is not supported
    return false;
  }
}

export { BlockSupportTrait };
