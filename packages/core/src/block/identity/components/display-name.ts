import { StringTag } from "@serenityjs/nbt";

import { BlockPermutation } from "../permutation";
import { BlockType } from "../type";

import { BlockTypeComponent } from "./component";

class BlockTypeDisplayNameComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:display_name";

  /**
   * Create a new display name component for a block type.
   * @param block The block type or permutation that the component will be attached to.
   * @param value The display name of the block type.
   */
  public constructor(block: BlockType | BlockPermutation, value?: string) {
    super(block);

    // Assign the display name value.
    this.setDisplayName(value ?? this.type.identifier);
  }

  /**
   * Get the display name of the block type.
   * @returns The display name of the block type.
   */
  public getDisplayName(): string {
    // Get the display name component.
    const component = this.component.get<StringTag>("value");

    // Return the display name.
    return component?.valueOf() ?? "";
  }

  /**
   * Set the display name of the block type.
   * @param value The display name of the block type.
   */
  public setDisplayName(value: string): void {
    // Set the display name component.
    this.component.add(new StringTag(value, "value"));
  }
}

export { BlockTypeDisplayNameComponent };
