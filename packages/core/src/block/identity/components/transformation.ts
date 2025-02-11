import { FloatTag, IntTag } from "@serenityjs/nbt";

import { BlockType } from "../type";
import { BlockPermutation } from "../permutation";

import { BlockTypeComponent } from "./property";

const DefaultTransformationProperties: Partial<BlockTypeTransformationComponent> =
  {
    translation: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    rotation_pivot: [0, 0, 0],
    scale_pivot: [0, 0, 0]
  };

class BlockTypeTransformationComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:transformation";

  /**
   * How many pixels to translate the geometry.
   */
  public get translation(): [number, number, number] {
    // Get the translation of the of the transformation
    const x = this.component.getTag<FloatTag>("TX")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("TY")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("TZ")?.value ?? 0;

    // Return the translation as a tuple
    return [x, y, z];
  }

  /**
   * How many pixels to translate the geometry.
   */
  public set translation(value: [number, number, number]) {
    // Set the translation of the transformation
    this.component.createFloatTag({ name: "TX", value: value[0] });
    this.component.createFloatTag({ name: "TY", value: value[1] });
    this.component.createFloatTag({ name: "TZ", value: value[2] });
  }

  /**
   * How many degrees to rotate the geometry. Must be in increments of 90. Can be negative. If not in increment of 90, the game will round to the nearest 90 increment.
   */
  public get rotation(): [number, number, number] {
    // Get the rotation of the transformation
    const x = this.component.getTag<IntTag>("RX")?.value ?? 0;
    const y = this.component.getTag<IntTag>("RY")?.value ?? 0;
    const z = this.component.getTag<IntTag>("RZ")?.value ?? 0;

    // Return the rotation as a tuple
    return [x, y, z];
  }

  /**
   * How many degrees to rotate the geometry. Must be in increments of 90. Can be negative. If not in increment of 90, the game will round to the nearest 90 increment.
   */
  public set rotation(value: [number, number, number]) {
    // Set the rotation of the transformation
    this.component.createIntTag({ name: "RX", value: value[0] });
    this.component.createIntTag({ name: "RY", value: value[1] });
    this.component.createIntTag({ name: "RZ", value: value[2] });
  }

  /**
   * How many pixels to scale the geometry.
   */
  public get scale(): [number, number, number] {
    // Get the scale of the transformation
    const x = this.component.getTag<FloatTag>("SX")?.value ?? 1;
    const y = this.component.getTag<FloatTag>("SY")?.value ?? 1;
    const z = this.component.getTag<FloatTag>("SZ")?.value ?? 1;

    // Return the scale as a tuple
    return [x, y, z];
  }

  /**
   * How many pixels to scale the geometry.
   */
  public set scale(value: [number, number, number]) {
    // Set the scale of the transformation
    this.component.createFloatTag({ name: "SX", value: value[0] });
    this.component.createFloatTag({ name: "SY", value: value[1] });
    this.component.createFloatTag({ name: "SZ", value: value[2] });
  }

  /**
   * The pivot point to rotate the geometry around.
   */
  public get rotation_pivot(): [number, number, number] {
    // Get the rotation pivot of the transformation
    const x = this.component.getTag<FloatTag>("RXP")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("RYP")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("RZP")?.value ?? 0;

    // Return the rotation pivot as a tuple
    return [x, y, z];
  }

  /**
   * The pivot point to rotate the geometry around.
   */
  public set rotation_pivot(value: [number, number, number]) {
    // Set the rotation pivot of the transformation
    this.component.createFloatTag({ name: "RXP", value: value[0] });
    this.component.createFloatTag({ name: "RYP", value: value[1] });
    this.component.createFloatTag({ name: "RZP", value: value[2] });
  }

  /**
   * The pivot point to scale the geometry around.
   */
  public get scale_pivot(): [number, number, number] {
    // Get the scale pivot of the transformation
    const x = this.component.getTag<FloatTag>("SXP")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("SYP")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("SZP")?.value ?? 0;

    // Return the scale pivot as a tuple
    return [x, y, z];
  }

  /**
   * The pivot point to scale the geometry around.
   */
  public set scale_pivot(value: [number, number, number]) {
    // Set the scale pivot of the transformation
    this.component.createFloatTag({ name: "SXP", value: value[0] });
    this.component.createFloatTag({ name: "SYP", value: value[1] });
    this.component.createFloatTag({ name: "SZP", value: value[2] });
  }

  /**
   * Create a new block selection box property for a block definition
   * @param block The block type or permutation
   * @param properties The selection box properties
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockTypeTransformationComponent>
  ) {
    super(block);

    // Assign the default transformation properties
    properties = { ...DefaultTransformationProperties, ...properties };

    // Create an hasJsonVersionBeforeValidation tag for the property
    this.component.createByteTag({
      name: "hasJsonVersionBeforeValidation",
      value: 0
    });

    // Set the properties of the transformation
    if (properties?.translation) this.translation = properties.translation;
    if (properties?.rotation) this.rotation = properties.rotation;
    if (properties?.scale) this.scale = properties.scale;
    if (properties?.rotation_pivot)
      this.rotation_pivot = properties.rotation_pivot;
    if (properties?.scale_pivot) this.scale_pivot = properties.scale_pivot;
  }
}

export { BlockTypeTransformationComponent };
