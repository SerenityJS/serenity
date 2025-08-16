import { ByteTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

class BlockTypeLightDampeningComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:light_dampening";

  /**
   * Create a new light dampening property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param lightDampening The amount of light that the block property will dampen.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    lightDampening?: number
  ) {
    super(block);

    // Set the light dampening value.
    this.setLightDampening(lightDampening ?? 0);
  }

  /**
   * Get the light dampening of the block type.
   * @returns The light dampening of the block type.
   */
  public getLightDampening(): number {
    return this.component.get<ByteTag>("lightLevel")?.valueOf() ?? 0;
  }

  /**
   * Set the light dampening of the block type.
   * @param value The light dampening of the block type.
   */
  public setLightDampening(value: number): void {
    this.component.add(new ByteTag(value, "lightLevel"));
  }
}

export { BlockTypeLightDampeningComponent };
