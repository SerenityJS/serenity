import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";
import { BlockTypeComponentCollection } from "../collection";

class BlockTypeComponent {
  /**
   * The component identifier of the block type.
   */
  public static readonly identifier: string;

  /**
   * The component identifier of the block type.
   */
  public readonly identifier = (this.constructor as typeof BlockTypeComponent)
    .identifier;

  /**
   * The properties collection of the block type.
   */
  protected readonly collection: BlockTypeComponentCollection;

  /**
   * The block type of the component.
   */
  protected readonly type: BlockType;

  /**
   * The component value of the block type.
   */
  protected get component(): CompoundTag {
    return this.collection.get<CompoundTag>(this.identifier)!;
  }

  /**
   * Creates a new permutation property.
   * @param permutation The permutation of that this property will be attached to.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    ..._args: Array<unknown>
  ) {
    // Assign the properties of the component.
    this.type = block instanceof BlockPermutation ? block.type : block;
    this.collection = block.components;

    // Create a new compound tag for the component
    this.collection.add(new CompoundTag(this.identifier));

    // Add the property to the collection, if it doesn't already exist.
    if (!this.collection.components.has(this.identifier))
      this.collection.components.set(this.identifier, this);
  }
}

export { BlockTypeComponent };
