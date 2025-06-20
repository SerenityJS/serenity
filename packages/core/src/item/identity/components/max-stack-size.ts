import {
  BaseTag,
  ByteTag,
  CompoundTag,
  IntTag,
  TagType
} from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeMaxStackComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:max_stack_size";

  /**
   * Create a new max stack size component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The maximum stack size of the item type.
   * @returns A new max stack size component.
   */
  public constructor(type: ItemType, value?: number) {
    super(type);

    // Assign the max stack size value.
    this.setMaxStackSize(value ?? 64);
  }

  /**
   * Get the max stack size component.
   * @returns The max stack size component.
   */
  public getMaxStackSize(): number {
    // Get the max stack size component.
    const component = this.component.get<ByteTag>("value");

    // Return the max stack size.
    return component?.valueOf() ?? 64;
  }

  /**
   * Set the max stack size component.
   * @param value The max stack size component.
   */
  public setMaxStackSize(value: number): void {
    // Check if the value is valid. If not, set it to the default value.
    if (value < 0 || value > 64) value = 64;

    // Set the max stack size component.
    this.component.add(new ByteTag(value, "value"));
  }

  public static from(
    type: ItemType,
    defintion: BaseTag
  ): ItemTypeMaxStackComponent {
    // Create a new instance of the component using the type and compound tag.
    const component = new this(type);

    // Check if the definition is a IntTag or CompoundTag.
    if (defintion.type === TagType.Compound) {
      // Set the component's NBT data from the provided compound tag.
      component.collection.set(component.identifier, defintion as CompoundTag);
    } else if (defintion.type === TagType.Int) {
      // If it's an IntTag, set the max stack size directly.
      component.setMaxStackSize((defintion as IntTag).valueOf());
    }

    // Return the newly created component instance.
    return component;
  }
}

export { ItemTypeMaxStackComponent };
