import { FloatTag, ListTag, TagType } from "@serenityjs/nbt";

import { BlockTypeComponent } from "./component";

import type { BlockPermutation } from "../permutation";
import type { BlockType } from "../type";

interface BlockTypeSelectionBoxComponentOptions {
  /**
   * The origin of the selection box relative to the block.
   * The default value is [-8, 0, -8].
   */
  origin: [number, number, number];

  /**
   * The size of the selection box relative to the block.
   * The default value is [16, 16, 16].
   */
  size: [number, number, number];
}

class BlockTypeSelectionBoxComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:selection_box";

  /**
   * Create a new block selection box property for a block definition.
   * @param block The block type or permutation.
   * @param options The options for the selection box.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeSelectionBoxComponentOptions>
  ) {
    super(block);

    // Create an enabled tag for the property
    this.component.createByteTag({ name: "enabled", value: 1 });

    // Set the default values for the selection box
    this.setOrigin(options?.origin ?? [-8, 0, -8]);
    this.setSize(options?.size ?? [16, 16, 16]);
  }

  /**
   * Get the origin of the selection box
   * @returns The origin of the selection box as a tuple
   */
  public getOrigin(): [number, number, number] {
    // Get the origin of the selection box
    const { value } = this.component.getTag<ListTag<FloatTag>>("origin");

    // Return the origin as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * Set the origin of the selection box
   * @param value The origin of the selection box as a tuple
   */
  public setOrigin(value: [number, number, number]): void {
    // Set the origin of the selection box
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
   * Get the size of the selection box
   * @returns The size of the selection box as a tuple
   */
  public getSize(): [number, number, number] {
    // Get the size of the selection box
    const { value } = this.component.getTag<ListTag<FloatTag>>("size");

    // Return the size as a tuple
    return [value[0]!.value, value[1]!.value, value[2]!.value];
  }

  /**
   * Set the size of the selection box
   * @param value The size of the selection box as a tuple
   */
  public setSize(value: [number, number, number]): void {
    // Set the size of the selection box
    const size = this.component.createListTag({
      name: "size",
      listType: TagType.Float
    });

    // Set the size values
    size.push(new FloatTag({ value: value[0] }));
    size.push(new FloatTag({ value: value[1] }));
    size.push(new FloatTag({ value: value[2] }));
  }
}

export {
  BlockTypeSelectionBoxComponent,
  BlockTypeSelectionBoxComponentOptions
};
