import { ByteTag, CompoundTag, FloatTag } from "@serenityjs/nbt";

class PermutationProperties extends CompoundTag<unknown> {
  /**
   * Create a new component group.
   */
  public constructor() {
    super({ name: "components" });
  }

  /**
   * The light emission of the block type.
   */
  public get lightEmission(): number {
    // Check if the root tag has a light emission tag
    if (!this.hasTag("minecraft:light_emission")) return 0;

    // Get the light emission tag from the root tag
    const tag = this.getTag<CompoundTag<unknown>>("minecraft:light_emission");

    // Return the light emission value.
    return tag?.getTag<ByteTag>("emission")?.value ?? 0;
  }

  /**
   * The light emission of the block type.
   */
  public set lightEmission(value: number) {
    // Check if the root tag has a light emission tag
    if (this.hasTag("minecraft:light_emission")) {
      // Get the light emission tag from the root tag
      const tag = this.getTag<CompoundTag<unknown>>("minecraft:light_emission");

      // Set the light emission value.
      tag.createByteTag({ name: "emission", value });
    } else {
      // Create a compound tag for the light emission
      const tag = this.createCompoundTag({ name: "minecraft:light_emission" });

      // Add the light emission property to the light emission
      tag.createByteTag({ name: "emission", value });
    }
  }

  /**
   * The hardness of the block type.
   */
  public get hardness(): number {
    // Check if the root tag has a hardness tag
    if (!this.hasTag("minecraft:destructible_by_mining")) return 0;

    // Get the hardness tag from the root tag
    const tag = this.getTag<CompoundTag<unknown>>(
      "minecraft:destructible_by_mining"
    );

    // Return the hardness value.
    return tag?.getTag<FloatTag>("hardness")?.value ?? 0;
  }

  /**
   * The hardness of the block type.
   */
  public set hardness(value: number) {
    // Check if the root tag has a hardness tag
    if (this.hasTag("minecraft:destructible_by_mining")) {
      // Get the hardness tag from the root tag
      const tag = this.getTag<CompoundTag<unknown>>(
        "minecraft:destructible_by_mining"
      );

      // Set the hardness value.
      tag.createFloatTag({ name: "hardness", value });
    } else {
      // Create a compound tag for the hardness
      const tag = this.createCompoundTag({
        name: "minecraft:destructible_by_mining"
      });

      // Add the hardness property to the hardness
      tag.createFloatTag({ name: "hardness", value });
    }
  }

  /**
   * The friction of the block type.
   */
  public get friction(): number {
    // Check if the root tag has a friction tag
    if (!this.hasTag("minecraft:friction")) return 0;

    // Get the friction tag from the root tag
    const tag = this.getTag<CompoundTag<unknown>>("minecraft:friction");

    // Return the friction value.
    return tag?.getTag<FloatTag>("value")?.value ?? 0;
  }

  /**
   * The friction of the block type.
   */
  public set friction(value: number) {
    // Check if the root tag has a friction tag
    if (this.hasTag("minecraft:friction")) {
      // Get the friction tag from the root tag
      const tag = this.getTag<CompoundTag<unknown>>("minecraft:friction");

      // Set the friction value.
      tag.createFloatTag({ name: "value", value });
    } else {
      // Create a compound tag for the friction
      const tag = this.createCompoundTag({ name: "minecraft:friction" });

      // Add the friction property to the friction
      tag.createFloatTag({ name: "value", value });
    }
  }

  // TODO: bones, culling
  public setGeometry(geometry: string): void {
    // Check if the root tag has a geometry tag
    if (this.hasTag("minecraft:geometry")) {
      // Get the geometry tag from the root tag
      const tag = this.getTag<CompoundTag<unknown>>("minecraft:geometry");

      // Create a bone_visibility tag
      tag.createCompoundTag({ name: "bone_visibility" });

      // Create a culling tag
      tag.createStringTag({ name: "culling", value: "" });

      // Set the geometry value.
      tag.createStringTag({ name: "identifier", value: geometry });
    } else {
      // Create a compound tag for the geometry
      const tag = this.createCompoundTag({ name: "minecraft:geometry" });

      // Create a bone_visibility tag
      tag.createCompoundTag({ name: "bone_visibility" });

      // Create a culling tag
      tag.createStringTag({ name: "culling", value: "" });

      // Add the geometry property to the geometry
      tag.createStringTag({ name: "identifier", value: geometry });
    }
  }

  // TODO: cleanup
  public setMaterialInstance(texture: string, renderMethod: string): void {
    // Check if the root tag has a material tag
    if (this.hasTag("minecraft:material_instances")) {
      // Get the material tag from the root tag
      const tag = this.getTag<CompoundTag<unknown>>(
        "minecraft:material_instances"
      );

      const materials = tag.getTag<CompoundTag<unknown>>("materials");

      // Create a new material instance tag
      const instance = materials.createCompoundTag({ name: "*" });

      // Set the texture value.
      instance.createStringTag({ name: "texture", value: texture });

      // Set the render method value.
      instance.createStringTag({ name: "render_method", value: renderMethod });

      // Set the face dimming value.
      instance.createByteTag({ name: "face_dimming", value: 1 });

      // Set the ambient occlusion value.
      instance.createByteTag({ name: "ambient_occlusion", value: 1 });
    } else {
      // Create a compound tag for the material
      const tag = this.createCompoundTag({
        name: "minecraft:material_instances"
      });

      // TODO: not sure what this is
      tag.createCompoundTag({ name: "mappings" });

      // Create a compound tag for the materials
      const materials = tag.createCompoundTag({ name: "materials" });

      // Create a new material instance tag
      const instance = materials.createCompoundTag({ name: "*" });

      // Set the texture value.
      instance.createStringTag({ name: "texture", value: texture });

      // Set the render method value.
      instance.createStringTag({ name: "render_method", value: renderMethod });

      // Set the face dimming value.
      instance.createByteTag({ name: "face_dimming", value: 1 });

      // Set the ambient occlusion value.
      instance.createByteTag({ name: "ambient_occlusion", value: 1 });
    }
  }
}

export { PermutationProperties };
