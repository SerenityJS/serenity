import { FloatTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./property";

class BlockTypeFrictionComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:friction";

  /**
   * The friction of the block property.
   */
  public get friction(): number {
    return this.component.getTag<FloatTag>("value")?.value ?? 0;
  }

  /**
   * The friction of the block property.
   */
  public set friction(value: number) {
    this.component.createFloatTag({ name: "value", value });
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

export { BlockTypeFrictionComponent };
