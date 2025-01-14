import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";
import { BlockPropertyCollection } from "../property-collection";

class BlockProperty {
  /**
   * The component of the permutation property.
   */
  public static readonly component: string;

  /**
   * The component of the permutation property.
   */
  public readonly component = (this.constructor as typeof BlockProperty)
    .component;

  /**
   * The properties of the permutation.
   */
  public readonly properties: BlockPropertyCollection;

  /**
   * The block type of the permutation.
   */
  public readonly type: BlockType;

  /**
   * The property value of the permutation.
   */
  protected get property(): CompoundTag<unknown> {
    return this.properties.getTag<CompoundTag<unknown>>(this.component);
  }

  /**
   * Creates a new permutation property.
   * @param permutation The permutation of that this property will be attached to.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    ..._args: Array<unknown>
  ) {
    this.properties = block.properties;
    this.type = block instanceof BlockPermutation ? block.type : block;

    // Check if the property already exists.
    if (this.properties.hasTag(this.component)) return;

    // If not, create the property.
    this.properties.createCompoundTag({ name: this.component });
  }
}

export { BlockProperty };
