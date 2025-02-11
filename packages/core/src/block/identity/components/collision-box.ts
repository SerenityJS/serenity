import { FloatTag, ListTag, TagType } from "@serenityjs/nbt";

import { BlockType } from "../type";
import { BlockPermutation } from "../permutation";

import { BlockTypeComponent } from "./property";

const DefaultCollisionBoxProperties = {
  origin: [-8, 0, -8],
  size: [16, 16, 16]
};

class BlockTypeCollisionBoxComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:collision_box";

  /**
   * The start position of the collision box in the block space
   * Default is [0, 0, 0]
   * Centered is [-8, -8, -8]
   */
  public get origin(): [number, number, number] {
    // Get the origin of the collision box
    const { value } = this.component.getTag<ListTag<FloatTag>>("origin");

    // Return the origin as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * The start position of the collision box in the block space
   * Default is [0, 0, 0]
   * Centered is [-8, -8, -8]
   */
  public set origin(value: [number, number, number]) {
    // Set the origin of the collision box
    const origin = this.component.createListTag({
      name: "origin",
      listType: TagType.Float
    });

    // Set the origin values
    origin.push(new FloatTag({ value: value[0] }));
    origin.push(new FloatTag({ value: value[1] }));
    origin.push(new FloatTag({ value: value[2] }));
  }

  /**
   * The size of the collision box in the block space
   */
  public get size(): [number, number, number] {
    // Get the size of the collision box
    const { value } = this.component.getTag<ListTag<FloatTag>>("size");

    // Return the size as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * The size of the collision box in the block space
   */
  public set size(value: [number, number, number]) {
    // Set the size of the collision box
    const size = this.component.createListTag({
      name: "size",
      listType: TagType.Float
    });

    // Set the size values
    size.push(new FloatTag({ value: value[0] }));
    size.push(new FloatTag({ value: value[1] }));
    size.push(new FloatTag({ value: value[2] }));
  }

  /**
   * Create a new block collision box property for a block definition
   * @param block The block type or permutation
   * @param properties The collision box properties
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockTypeCollisionBoxComponent>
  ) {
    super(block);

    // Assign the default collision box properties
    Object.assign(this, { ...DefaultCollisionBoxProperties, ...properties });

    // Create an enabled tag for the property
    this.component.createByteTag({ name: "enabled", value: 1 });
  }
}

export { BlockTypeCollisionBoxComponent };
