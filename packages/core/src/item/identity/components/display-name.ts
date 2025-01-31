import { StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeDisplayNameComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:display_name";

  /**
   * The display name of the item type.
   */
  public get value(): string {
    return this.component.getTag<StringTag>("value")?.value ?? "";
  }

  /**
   * The display name of the item type.
   */
  public set value(value: string) {
    this.component.createStringTag({ name: "value", value });
  }

  /**
   * Create a new display name component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The display name of the item type.
   */
  public constructor(type: ItemType, value?: string) {
    super(type);

    // Assign the display name value.
    this.value = value ?? "";
  }
}

export { ItemTypeDisplayNameComponent };
