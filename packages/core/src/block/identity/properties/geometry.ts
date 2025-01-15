import { StringTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockProperty } from "./property";

/**
 * The default properties of a geometry property.
 */
const DefaultBlockGeometryProperty: Partial<BlockGeometryProperty> = {
  identifier: "geometry.none",
  culling: ""
};

class BlockGeometryProperty extends BlockProperty {
  public static readonly component = "minecraft:geometry";

  /**
   * The identifier of the geometry model.
   */
  public set identifier(geometry: string) {
    this.property.createStringTag({ name: "identifier", value: geometry });
  }

  /**
   * The identifier of the geometry model.
   */
  public get identifier(): string {
    return this.property.getTag<StringTag>("identifier")?.value ?? "";
  }

  /**
   * The culling of the geometry model.
   */
  public set culling(value: string) {
    this.property.createStringTag({ name: "culling", value });
  }

  /**
   * The culling of the geometry model.
   */
  public get culling(): string {
    return this.property.getTag<StringTag>("culling")?.value ?? "";
  }

  /**
   * Create a new geometry property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param properties The properties of the geometry.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockGeometryProperty>
  ) {
    super(block);

    // Assign the properties.
    Object.assign(this, { ...DefaultBlockGeometryProperty, ...properties });

    // TODO: Implement bone visibility.
    this.property.createCompoundTag({ name: "bone_visibility" });
  }
}

export { BlockGeometryProperty };
