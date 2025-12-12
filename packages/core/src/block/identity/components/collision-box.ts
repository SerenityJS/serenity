import { ByteTag, CompoundTag, FloatTag, ListTag } from "@serenityjs/nbt";

import { BlockTypeComponent } from "./component";

import type { BlockPermutation } from "../permutation";
import type { BlockType } from "../type";

interface BlockTypeCollisionBox {
  /**
   * The origin of the collision box relative to the block.
   * The default value is [-8, 0, -8].
   */
  origin: [number, number, number];

  /**
   * The size of the collision box relative to the block.
   * The default value is [16, 16, 16].
   */
  size: [number, number, number];
}

interface BlockTypeCollisionBoxComponentOptions {
  /**
   * The collision boxes of the block.
   */
  boxes: Array<BlockTypeCollisionBox>;
}

class BlockTypeCollisionBoxComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:collision_box";

  /**
   * Create a new block collision box property for a block definition
   * @param block The block type or permutation
   * @param options The options for the collision box
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeCollisionBoxComponentOptions>
  ) {
    super(block);

    // Create an enabled tag for the property
    this.component.add(new ByteTag(1, "enabled"));

    // Create a list tag to hold the collision boxes
    this.component.add(new ListTag<CompoundTag>([], "boxes"));

    // Set the default values for the collision box
    if (options?.boxes) this.setBoxes(options.boxes);
    else {
      // Set a default collision box if none are provided
      this.setBoxes([
        {
          origin: [-8, 0, -8],
          size: [16, 16, 16]
        }
      ]);
    }
  }

  /**
   * Get the collision boxes of the block
   * @return The array of collision boxes
   */
  public getBoxes(): Array<BlockTypeCollisionBox> {
    // Prepare an array to hold the collision boxes
    const boxes: Array<BlockTypeCollisionBox> = [];

    // Get the list of boxes from the component tag
    const list = this.component.get<ListTag<CompoundTag>>("boxes");
    if (!list) return boxes;

    // Iterate over each box in the list
    for (const boxTag of list) {
      // Fetch the box properties
      const oX = boxTag.get<FloatTag>("minX")?.valueOf() ?? -8;
      const oY = boxTag.get<FloatTag>("minY")?.valueOf() ?? 0;
      const oZ = boxTag.get<FloatTag>("minZ")?.valueOf() ?? -8;
      const sX = boxTag.get<FloatTag>("maxX")?.valueOf() ?? 16;
      const sY = boxTag.get<FloatTag>("maxY")?.valueOf() ?? 16;
      const sZ = boxTag.get<FloatTag>("maxZ")?.valueOf() ?? 16;

      // Add the box to the array
      boxes.push({
        origin: [oX, oY, oZ],
        size: [sX, sY, sZ]
      });
    }

    // Return the array of collision boxes
    return boxes;
  }

  /**
   * Set the collision boxes of the block
   * @param boxes The array of collision boxes to set
   */
  public setBoxes(boxes: Array<BlockTypeCollisionBox>): void {
    // Get the list tag from the component
    let list = this.component.get<ListTag<CompoundTag>>("boxes");
    if (!list) {
      list = new ListTag<CompoundTag>([], "boxes");
      this.component.add(list);
    }

    // Clear the existing boxes
    list.length = 0;

    // Iterate over each box and add it to the list
    for (const box of boxes) {
      // Create a new compound tag for the box
      const boxTag = new CompoundTag();

      // Add the box properties to the tag
      boxTag.add(new FloatTag(box.origin[0], "minX"));
      boxTag.add(new FloatTag(box.origin[1], "minY"));
      boxTag.add(new FloatTag(box.origin[2], "minZ"));
      boxTag.add(new FloatTag(box.size[0], "maxX"));
      boxTag.add(new FloatTag(box.size[1], "maxY"));
      boxTag.add(new FloatTag(box.size[2], "maxZ"));

      // Add the box tag to the list
      list.push(boxTag);
    }
  }
}

export {
  BlockTypeCollisionBoxComponent,
  BlockTypeCollisionBoxComponentOptions
};
