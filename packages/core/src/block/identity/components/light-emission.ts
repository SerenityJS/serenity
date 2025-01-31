import { ByteTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./property";

class BlockTypeLightEmissionComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:light_emission";

  /**
   * The amount of light that the block property will emit.
   */
  public set lightEmission(value: number) {
    this.component.createByteTag({ name: "emission", value });
  }

  /**
   * The amount of light that the block property will emit.
   */
  public get lightEmission(): number {
    return this.component.getTag<ByteTag>("emission")?.value ?? 0;
  }

  /**
   * Create a new light emission property for a block definition.
   * @param permutation The block definition that this property will be attached to.
   * @param lightEmission The amount of light that the block property will emit.
   */
  public constructor(block: BlockType | BlockPermutation, lightEmission = 0) {
    super(block);

    // Set the light emission value.
    this.lightEmission = lightEmission;
  }
}

export { BlockTypeLightEmissionComponent };
