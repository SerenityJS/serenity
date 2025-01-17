import { FloatTag, ListTag, TagType } from "@serenityjs/nbt";

import { BlockPermutation, BlockProperty, BlockType } from "@serenityjs/core";

const DefaultSelectionBoxProperties = {
  origin: [0, 0, 0],
  size: [16, 16, 16]
};

class BlockSelectionBoxProperty extends BlockProperty {
  public static readonly component = "minecraft:selection_box";

  /**
   * The start position of the selection box in the block space
   * Default is [0, 0, 0]
   * Centered is [-8, -8, -8]
   */
  public get origin(): [number, number, number] {
    // Get the origin of the selection box
    const { value } = this.property.getTag<ListTag<FloatTag>>("origin");

    // Return the origin as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * The start position of the selection box in the block space
   * Default is [0, 0, 0]
   * Centered is [-8, -8, -8]
   */
  public set origin(value: [number, number, number]) {
    // Set the origin of the selection box
    const origin = this.property.createListTag({
      name: "origin",
      listType: TagType.Float
    });

    // Set the origin values
    origin.push(new FloatTag({ value: value[0] }));
    origin.push(new FloatTag({ value: value[1] }));
    origin.push(new FloatTag({ value: value[2] }));
  }

  /**
   * The size of the selection box in the block space
   */
  public get size(): [number, number, number] {
    // Get the size of the selection box
    const { value } = this.property.getTag<ListTag<FloatTag>>("size");

    // Return the size as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * The size of the selection box in the block space
   */
  public set size(value: [number, number, number]) {
    // Set the size of the selection box
    const size = this.property.createListTag({
      name: "size",
      listType: TagType.Float
    });

    // Set the size values
    size.push(new FloatTag({ value: value[0] }));
    size.push(new FloatTag({ value: value[1] }));
    size.push(new FloatTag({ value: value[2] }));
  }

  /**
   * Create a new block selection box property for a block definition
   * @param block The block type or permutation
   * @param properties The selection box properties
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockSelectionBoxProperty>
  ) {
    super(block);

    // Assign the default selection box properties
    Object.assign(this, { ...DefaultSelectionBoxProperties, ...properties });

    // Create an enabled tag for the property
    this.property.createByteTag({ name: "enabled", value: 1 });
  }
}

export { BlockSelectionBoxProperty };
