import { ByteTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeMaxStackComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:max_stack_size";

  /**
   * The maximum stack size of the item type.
   */
  public get value(): number {
    return this.component.getTag<ByteTag>("value")?.value ?? 64;
  }

  /**
   * The maximum stack size of the item type.
   */
  public set value(value: number) {
    // Check if the value is valid. If not, set it to the default value.
    if (value < 0 || value > 64) value = 64;

    // Create the max stack size tag with the value.
    this.component.createByteTag({ name: "value", value });
  }

  /**
   * Create a new max stack size component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The maximum stack size of the item type.
   * @returns A new max stack size component.
   */
  public constructor(type: ItemType, value?: number) {
    super(type);

    // Assign the max stack size value.
    this.value = value ?? 64;
  }
}

export { ItemTypeMaxStackComponent };
