import { StringTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

/**
 * The default properties of a geometry property.
 */
const DefaultBlockTypeGeometryComponent: Partial<BlockTypeGeometryComponent> = {
  identifier: "geometry.none",
  culling: ""
};

class BlockTypeGeometryComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:geometry";

  /**
   * The identifier of the geometry model.
   */
  public set model(geometry: string) {
    this.component.createStringTag({ name: "identifier", value: geometry });
  }

  /**
   * The identifier of the geometry model.
   */
  public get model(): string {
    return this.component.getTag<StringTag>("identifier")?.value ?? "";
  }

  /**
   * The culling of the geometry model.
   */
  public set culling(value: string) {
    this.component.createStringTag({ name: "culling", value });
  }

  /**
   * The culling of the geometry model.
   */
  public get culling(): string {
    return this.component.getTag<StringTag>("culling")?.value ?? "";
  }

  /**
   * Create a new geometry property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param properties The properties of the geometry.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockTypeGeometryComponent>
  ) {
    super(block);

    // Assign the default geometry properties.
    properties = { ...DefaultBlockTypeGeometryComponent, ...properties };

    // TODO: Implement bone visibility.
    this.component.createCompoundTag({ name: "bone_visibility" });

    // Assign the default geometry properties.
    if (properties?.model) this.model = properties.model;
    if (properties?.culling) this.culling = properties.culling;
  }
}

export { BlockTypeGeometryComponent };
