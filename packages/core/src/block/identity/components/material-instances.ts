import { CompoundTag, StringTag } from "@serenityjs/nbt";
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
  public readonly materials: CompoundTag;

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
    this.component.add(new CompoundTag("mappings"));

    // Create the material instances tag.
    this.materials = new CompoundTag("materials");

    // Add the material instances tag to the component.
    this.component.add(this.materials);

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
    const instance = this.materials.add(new CompoundTag(key));

    // Set the texture value of the material instance.
    instance.add(new StringTag(options.texture ?? "", "texture"));

    // Set the render method value of the material instance.
    instance.add(
      new StringTag(
        options.render_method ?? MaterialRenderMethod.AlphaTest,
        "render_method"
      )
    );

    // Set the face dimming value of the material instance.
    instance.add(
      new StringTag(options.face_dimming ? "true" : "false", "face_dimming")
    );

    // Set the ambient occlusion value of the material instance.
    instance.add(
      new StringTag(
        options.ambient_occlusion ? "true" : "false",
        "ambient_occlusion"
      )
    );
  }

  /**
   * Remove a material instance.
   */
  public removeMaterialInstance(key: string): void {
    this.materials.delete(key);
  }
}

export {
  BlockTypeMaterialInstancesComponent,
  BlockTypeMaterialInstancesComponentOptions,
  MaterialInstanceOptions
};
