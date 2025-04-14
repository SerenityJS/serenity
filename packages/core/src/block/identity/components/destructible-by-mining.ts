import { FloatTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

class BlockTypeDestructableByMiningComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:destructible_by_mining";

  /**
   * Create a new hardness property for a block definition.
   * @param block The block definition that this property will be attached to.
   * @param hardness The hardness of the block type.
   */
  public constructor(block: BlockType | BlockPermutation, hardness?: number) {
    super(block);

    // Set default values for the hardness property
    this.setHardness(hardness ?? 0);
  }

  /**
   * Get the hardness of the block type.
   * @returns The hardness of the block type.
   */
  public getHardness(): number {
    return this.component.getTag<FloatTag>("value")?.value ?? 0;
  }

  /**
   * Set the hardness of the block type.
   * @param value The hardness of the block type.
   */
  public setHardness(value: number): void {
    this.component.createFloatTag({ name: "value", value });
  }
}

export { BlockTypeDestructableByMiningComponent };
