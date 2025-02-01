import { ByteTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeCanDestroyInCreativeComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:can_destroy_in_creative";

  /**
   * Whether the item type can destroy blocks in creative mode.
   */
  public get value(): boolean {
    return this.component.getTag<ByteTag>("value")?.value === 1;
  }

  /**
   * Whether the item type can destroy blocks in creative mode.
   */
  public set value(value: boolean) {
    this.component.createByteTag({ name: "value", value: value ? 1 : 0 });
  }

  /**
   * Create a new can destroy in creative component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value Whether the item type can destroy blocks in creative mode.
   * @returns A new can destroy in creative component.
   */
  public constructor(type: ItemType, value: boolean) {
    super(type);

    // Assign the can destroy in creative value.
    this.value = value;
  }
}

export { ItemTypeCanDestroyInCreativeComponent };
