import { BlockFace } from "@serenityjs/protocol";

import { BlockType } from "../identity";
import { Block } from "../block";

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
    // Prepare a flag to track if the block is supported
    let supported = false;

    // Check if the block is supported from any of the defined directions
    for (const direction of this.supportDirections) {
      // Get the block in the support direction
      const supportBlock = this.block.face(direction);

      // Check if the support block exists and is of the correct type
      if (supportBlock && supportBlock.type == this.supportBlockType) {
        // Set the supported flag to true
        supported = true;
        break;
      } else if (
        supportBlock &&
        this.supportBlockType === null &&
        supportBlock.isSolid
      ) {
        // If no specific support block type is defined, any solid block can provide support
        supported = true;
        break;
      }
    }

    // If the block is not supported, destroy it
    if (!supported) this.block.destroy({ dropLoot: true });
  }
}

export { BlockSupportTrait };
