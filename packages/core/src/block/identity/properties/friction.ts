import { FloatTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockProperty } from "./property";

class BlockFrictionProperty extends BlockProperty {
  public static readonly component = "minecraft:friction";

  /**
   * The friction of the block property.
   */
  public get friction(): number {
    return this.property.getTag<FloatTag>("value")?.value ?? 0;
  }

  /**
   * The friction of the block property.
   */
  public set friction(value: number) {
    this.property.createFloatTag({ name: "value", value });
  }

  /**
   * Create a new friction property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param friction The friction of the block type.
   */
  public constructor(block: BlockType | BlockPermutation, friction = 0) {
    super(block);

    // Set the friction value.
    this.friction = friction;
  }
}

export { BlockFrictionProperty };
