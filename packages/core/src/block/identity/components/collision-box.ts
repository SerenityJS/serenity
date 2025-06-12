import { ByteTag, FloatTag, ListTag } from "@serenityjs/nbt";

import { BlockTypeComponent } from "./component";

import type { BlockPermutation } from "../permutation";
import type { BlockType } from "../type";

interface BlockTypeCollisionBoxComponentOptions {
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

    // Set the default values for the collision box
    this.setOrigin(options?.origin ?? [-8, 0, -8]);
    this.setSize(options?.size ?? [16, 16, 16]);
  }

  /**
   * Get the origin of the collision box
   * @returns The origin of the collision box as a tuple
   */
  public getOrigin(): [number, number, number] {
    // Get the origin of the collision box
    const value = this.component.get<ListTag<FloatTag>>("origin")!;

    // Return the origin as a tuple
    return [value[0]!.valueOf(), value[1]!.valueOf(), value[2]!.valueOf()];
  }

  /**
   * Set the origin of the collision box
   * @param value The origin of the collision box as a tuple
   */
  public setOrigin(value: [number, number, number]): void {
    // Set the origin of the collision box
    const origin = new ListTag<FloatTag>([], "origin");

    // Add the origin tag to the component
    this.component.add(origin);

    // Set the origin values
    origin.push(new FloatTag(value[0]));
    origin.push(new FloatTag(value[1]));
    origin.push(new FloatTag(value[2]));
  }

  /**
   * Get the size of the collision box
   * @returns The size of the collision box as a tuple
   */
  public getSize(): [number, number, number] {
    // Get the size of the collision box
    const value = this.component.get<ListTag<FloatTag>>("size")!;

    // Return the size as a tuple
    return [value[0]!.valueOf(), value[1]!.valueOf(), value[2]!.valueOf()];
  }

  /**
   * Set the size of the collision box
   * @param value The size of the collision box as a tuple
   */
  public setSize(value: [number, number, number]): void {
    // Set the size of the collision box
    const size = new ListTag<FloatTag>([], "size");

    // Add the size tag to the component
    this.component.add(size);

    // Set the size values
    size.push(new FloatTag(value[0]));
    size.push(new FloatTag(value[1]));
    size.push(new FloatTag(value[2]));
  }
}

export {
  BlockTypeCollisionBoxComponent,
  BlockTypeCollisionBoxComponentOptions
};
