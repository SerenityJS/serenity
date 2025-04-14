import { ByteTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

class BlockTypeLightEmissionComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:light_emission";

  /**
   * Create a new light emission property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param lightEmission The amount of light that the block property will emit.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    lightEmission?: number
  ) {
    super(block);

    // Set the light emission value.
    this.setLightEmission(lightEmission ?? 0);
  }

  /**
   * Get the light emission of the block type.
   * @returns The light emission of the block type.
   */
  public getLightEmission(): number {
    return this.component.getTag<ByteTag>("emission")?.value ?? 0;
  }

  /**
   * Set the light emission of the block type.
   * @param value The light emission of the block type.
   */
  public setLightEmission(value: number): void {
    this.component.createByteTag({ name: "emission", value });
  }
}

export { BlockTypeLightEmissionComponent };
