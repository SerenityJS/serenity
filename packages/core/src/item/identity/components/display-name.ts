import { StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeDisplayNameComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:display_name";
  /**
   * Create a new display name component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The display name of the item type.
   */
  public constructor(type: ItemType, value?: string) {
    super(type);

    // Assign the display name value.
    this.setDisplayName(value ?? type.identifier);
  }

  /**
   * Get the display name of the item type.
   * @returns The display name of the item type.
   */
  public getDisplayName(): string {
    // Get the display name component.
    const component = this.component.get<StringTag>("value");

    // Return the display name.
    return component?.valueOf() ?? "";
  }

  /**
   * Set the display name of the item type.
   * @param value The display name of the item type.
   */
  public setDisplayName(value: string): void {
    // Set the display name component.
    this.component.add(new StringTag(value, "value"));
  }
}

export { ItemTypeDisplayNameComponent };
