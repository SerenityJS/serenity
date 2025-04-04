import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";
import { MaterialInstanceProperties } from "../../../types";

import { BlockTypeComponent } from "./component";

/**
 * Refrence the wiki for more information: https://wiki.bedrock.dev/blocks/block-components.html#material-instances
 */
class BlockTypeMaterialInstancesComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:material_instances";

  /**
   * The material instances of the block.
   */
  public readonly materials: CompoundTag<unknown>;

  /**
   * Create a new material instances property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param properties The properties of the material instances.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Record<string, MaterialInstanceProperties>
  ) {
    super(block);

    // Create a material instances tag.
    this.component.createCompoundTag({ name: "mappings" }); // Not sure what this is.

    // Create the material instances tag.
    this.materials = this.component.createCompoundTag({ name: "materials" });

    // Add the material instances.
    if (properties) {
      // Iterate over the properties.
      for (const key in properties) {
        // Get the properties of the material instance.
        const instance = properties[key] as MaterialInstanceProperties;

        // Create a new material instance.
        this.createMaterialInstance(key, instance);
      }
    }
  }

  /**
   * Create a new material instance.
   * @param key The key of the material instance.
   * @param properties The properties of the material instance.
   */
  public createMaterialInstance(
    key: string,
    properties: MaterialInstanceProperties
  ): void {
    // Create a new material instance tag.
    const instance = this.materials.createCompoundTag({ name: key });

    // Set the texture value of the material instance.
    instance.createStringTag({ name: "texture", value: properties.texture });

    // Set the render method value of the material instance.
    instance.createStringTag({
      name: "render_method",
      value: properties.render_method
    });

    // Set the face dimming value of the material instance.
    instance.createByteTag({
      name: "face_dimming",
      value: properties.face_dimming ? 1 : 0
    });

    // Set the ambient occlusion value of the material instance.
    instance.createByteTag({
      name: "ambient_occlusion",
      value: properties.ambient_occlusion ? 1 : 0
    });
  }

  /**
   * Remove a material instance.
   */
  public removeMaterialInstance(key: string): void {
    this.materials.removeTag(key);
  }
}

export { BlockTypeMaterialInstancesComponent };
