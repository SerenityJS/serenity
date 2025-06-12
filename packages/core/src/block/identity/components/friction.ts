import { FloatTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

class BlockTypeFrictionComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:friction";

  /**
   * Create a new friction property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param friction The friction of the block type.
   */
  public constructor(block: BlockType | BlockPermutation, friction?: number) {
    super(block);

    // Set the friction value.
    this.setFriction(friction ?? 0);
  }

  /**
   * Set the friction of the block property.
   * @param value The friction of the block property.
   */
  public getFriction(): number {
    return this.component.get<FloatTag>("value")?.valueOf() ?? 0;
  }

  /**
   * Set the friction of the block property.
   * @param value The friction of the block property.
   */
  public setFriction(value: number): void {
    this.component.add(new FloatTag(value, "value"));
  }
}

export { BlockTypeFrictionComponent };
