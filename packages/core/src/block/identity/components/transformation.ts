import { FloatTag, IntTag } from "@serenityjs/nbt";

import { BlockType } from "../type";
import { BlockPermutation } from "../permutation";

import { BlockTypeComponent } from "./component";

interface BlockTypeTransformationComponentOptions {
  /**
   * How many pixels to translate the block in the x, y, and z directions.
   */
  translation: [number, number, number];

  /**
   * How many degrees to rotate the block around the x, y, and z axes.
   */
  rotation: [number, number, number];

  /**
   * How much to scale the block in the x, y, and z directions.
   */
  scale: [number, number, number];

  /**
   * The pivot point around which the block will be rotated.
   */
  rotation_pivot: [number, number, number];

  /**
   * The pivot point around which the block will be scaled.
   */
  scale_pivot: [number, number, number];
}

class BlockTypeTransformationComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:transformation";

  /**
   * Create a new block selection box property for a block definition.
   * @param block The block type or permutation.
   * @param options The options for the transformation.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeTransformationComponentOptions>
  ) {
    super(block);

    // Assign the default transformation properties
    this.setTranslation(options?.translation ?? [0, 0, 0]);
    this.setRotation(options?.rotation ?? [0, 0, 0]);
    this.setScale(options?.scale ?? [1, 1, 1]);
    this.setRotationPivot(options?.rotation_pivot ?? [0, 0, 0]);
    this.setScalePivot(options?.scale_pivot ?? [0, 0, 0]);
  }

  /**
   * Get the translation of the block type.
   * @returns The translation of the block type as a tuple.
   */
  public getTranslation(): [number, number, number] {
    // Get the translation of the block type
    const x = this.component.getTag<FloatTag>("TX")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("TY")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("TZ")?.value ?? 0;

    // Return the translation as a tuple
    return [x, y, z];
  }

  /**
   * Set the translation of the block type.
   * @param value The translation of the block type as a tuple.
   */
  public setTranslation(value: [number, number, number]): void {
    // Set the translation of the block type
    this.component.createFloatTag({ name: "TX", value: value[0] });
    this.component.createFloatTag({ name: "TY", value: value[1] });
    this.component.createFloatTag({ name: "TZ", value: value[2] });
  }

  /**
   * Get the rotation of the block type.
   * @returns The rotation of the block type as a tuple.
   */
  public getRotation(): [number, number, number] {
    // Get the rotation of the block type
    const x = this.component.getTag<IntTag>("RX")?.value ?? 0;
    const y = this.component.getTag<IntTag>("RY")?.value ?? 0;
    const z = this.component.getTag<IntTag>("RZ")?.value ?? 0;

    // Return the rotation as a tuple
    return [x * 90, y * 90, z * 90];
  }

  /**
   * Set the rotation of the block type.
   * @param value The rotation of the block type as a tuple.
   */
  public setRotation(value: [number, number, number]): void {
    // Normalize the rotation values
    const rx = Math.floor(value[0] / 90) % 4;
    const ry = Math.floor(value[1] / 90) % 4;
    const rz = Math.floor(value[2] / 90) % 4;

    // Set the rotation of the block type
    this.component.createIntTag({ name: "RX", value: rx });
    this.component.createIntTag({ name: "RY", value: ry });
    this.component.createIntTag({ name: "RZ", value: rz });
  }

  /**
   * Get the scale of the block type.
   * @returns The scale of the block type as a tuple.
   */
  public getScale(): [number, number, number] {
    // Get the scale of the block type
    const x = this.component.getTag<FloatTag>("SX")?.value ?? 1;
    const y = this.component.getTag<FloatTag>("SY")?.value ?? 1;
    const z = this.component.getTag<FloatTag>("SZ")?.value ?? 1;

    // Return the scale as a tuple
    return [x, y, z];
  }

  /**
   * Set the scale of the block type.
   * @param value The scale of the block type as a tuple.
   */
  public setScale(value: [number, number, number]): void {
    // Set the scale of the block type
    this.component.createFloatTag({ name: "SX", value: value[0] });
    this.component.createFloatTag({ name: "SY", value: value[1] });
    this.component.createFloatTag({ name: "SZ", value: value[2] });
  }

  /**
   * Get the rotation pivot of the block type.
   * @returns The rotation pivot of the block type as a tuple.
   */
  public getRotationPivot(): [number, number, number] {
    // Get the rotation pivot of the block type
    const x = this.component.getTag<FloatTag>("RXP")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("RYP")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("RZP")?.value ?? 0;

    // Return the rotation pivot as a tuple
    return [x, y, z];
  }

  /**
   * Set the rotation pivot of the block type.
   * @param value The rotation pivot of the block type as a tuple.
   */
  public setRotationPivot(value: [number, number, number]): void {
    // Set the rotation pivot of the block type
    this.component.createFloatTag({ name: "RXP", value: value[0] });
    this.component.createFloatTag({ name: "RYP", value: value[1] });
    this.component.createFloatTag({ name: "RZP", value: value[2] });
  }

  /**
   * Get the scale pivot of the block type.
   * @returns The scale pivot of the block type as a tuple.
   */
  public getScalePivot(): [number, number, number] {
    // Get the scale pivot of the block type
    const x = this.component.getTag<FloatTag>("SXP")?.value ?? 0;
    const y = this.component.getTag<FloatTag>("SYP")?.value ?? 0;
    const z = this.component.getTag<FloatTag>("SZP")?.value ?? 0;

    // Return the scale pivot as a tuple
    return [x, y, z];
  }

  /**
   * Set the scale pivot of the block type.
   * @param value The scale pivot of the block type as a tuple.
   */
  public setScalePivot(value: [number, number, number]): void {
    // Set the scale pivot of the block type
    this.component.createFloatTag({ name: "SXP", value: value[0] });
    this.component.createFloatTag({ name: "SYP", value: value[1] });
    this.component.createFloatTag({ name: "SZP", value: value[2] });
  }
}

export {
  BlockTypeTransformationComponent,
  BlockTypeTransformationComponentOptions
};
