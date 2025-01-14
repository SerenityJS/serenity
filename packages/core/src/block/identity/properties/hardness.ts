import { FloatTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockProperty } from "./property";

class BlockHardnessProperty extends BlockProperty {
  public static readonly component = "minecraft:destructible_by_mining";

  /**
   * The hardness of the block property.
   */
  public get hardness(): number {
    return this.property.getTag<FloatTag>("value")?.value ?? 0;
  }

  /**
   * The hardness of the block property.
   */
  public set hardness(value: number) {
    this.property.createFloatTag({ name: "value", value });
  }

  /**
   * Create a new hardness property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param hardness The hardness of the block type.
   */
  public constructor(block: BlockType | BlockPermutation, hardness = 0) {
    super(block);

    // Set the hardness value.
    this.hardness = hardness;
  }
}

export { BlockHardnessProperty };
