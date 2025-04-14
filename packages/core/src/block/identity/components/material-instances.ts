import { CompoundTag } from "@serenityjs/nbt";
import { MaterialRenderMethod } from "@serenityjs/protocol";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

interface MaterialInstanceOptions {
  /**
   * The texture of the block.
   */
  texture: string;

  /**
   * The render method to use for the block.
   */
  render_method: MaterialRenderMethod;

  /**
   * Whether the block should have face dimming.
   */
  face_dimming: boolean;

  /**
   * Whether the block should have ambient occlusion enabled.
   */
  ambient_occlusion: boolean;
}

type BlockTypeMaterialInstancesComponentOptions = Record<
  string,
  Partial<MaterialInstanceOptions>
>;

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
   * @param options The options for the material instances property.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeMaterialInstancesComponentOptions>
  ) {
    super(block);

    // Create a material instances tag.
    this.component.createCompoundTag({ name: "mappings" }); // Not sure what this is.

    // Create the material instances tag.
    this.materials = this.component.createCompoundTag({ name: "materials" });

    // Add the material instances.
    if (options) {
      // Iterate over the options.
      for (const key in options) {
        // Get the options of the material instance.
        const instance = options[key] as MaterialInstanceOptions;

        // Create a new material instance.
        this.createMaterialInstance(key, instance);
      }
    }
  }

  /**
   * Create a new material instance.
   * @param key The key of the material instance.
   * @param options The options for the material instance.
   */
  public createMaterialInstance(
    key: string,
    options: Partial<MaterialInstanceOptions>
  ): void {
    // Create a new material instance tag.
    const instance = this.materials.createCompoundTag({ name: key });

    // Set the texture value of the material instance.
    instance.createStringTag({ name: "texture", value: options.texture ?? "" });

    // Set the render method value of the material instance.
    instance.createStringTag({
      name: "render_method",
      value: options.render_method ?? MaterialRenderMethod.AlphaTest
    });

    // Set the face dimming value of the material instance.
    instance.createByteTag({
      name: "face_dimming",
      value: options.face_dimming ? 1 : 0
    });

    // Set the ambient occlusion value of the material instance.
    instance.createByteTag({
      name: "ambient_occlusion",
      value: options.ambient_occlusion ? 1 : 0
    });
  }

  /**
   * Remove a material instance.
   */
  public removeMaterialInstance(key: string): void {
    this.materials.removeTag(key);
  }
}

export {
  BlockTypeMaterialInstancesComponent,
  BlockTypeMaterialInstancesComponentOptions,
  MaterialInstanceOptions
};
