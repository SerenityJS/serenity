import { StringTag } from "@serenityjs/nbt";

import { BlockTypeComponent } from "./component";

import type { BlockType } from "../type";
import type { BlockPermutation } from "../permutation";

interface BlockTypeGeometryComponentOptions {
  /**
   * The model identifier of the geometry.
   */
  identifier: string;
}

class BlockTypeGeometryComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:geometry";

  /**
   * Create a new geometry property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param options The options for the geometry property.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeGeometryComponentOptions>
  ) {
    super(block);

    // TODO: Implement bone visibility.
    this.component.createCompoundTag({ name: "bone_visibility" });

    // Create the geometry property
    this.setModelIdentifier(options?.identifier ?? "geometry.none");
  }

  /**
   * Get the geometry model of the block type.
   * @returns The geometry model of the block type.
   */
  public getModelIdentifier(): string {
    // Get the model of the geometry
    return this.component.getTag<StringTag>("identifier")?.value ?? "";
  }

  /**
   * Set the geometry model of the block type.
   * @param value The geometry model of the block type.
   */
  public setModelIdentifier(value: string): void {
    // Set the model of the geometry
    this.component.createStringTag({ name: "identifier", value });
  }
}

export { BlockTypeGeometryComponent, BlockTypeGeometryComponentOptions };
