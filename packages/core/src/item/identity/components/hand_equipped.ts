import { ByteTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeHandEquippedComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:hand_equipped";

  /**
   * Create a new hand equipped component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value Whether the item type is hand equipped.
   */
  public constructor(type: ItemType, value?: boolean) {
    super(type);

    // Assign the hand equipped value.
    this.setHandEquipped(value ?? false);
  }

  /**
   * Whether the item type is hand equipped.
   * @returns Whether the item type is hand equipped.
   */
  public getHandEquipped(): boolean {
    // Get the hand equipped component.
    const component = this.component.getTag<ByteTag>("value");

    // Return the hand equipped value.
    return component?.value === 1;
  }

  /**
   * Set whether the item type is hand equipped.
   * @param value Whether the item type is hand equipped.
   */
  public setHandEquipped(value: boolean): void {
    // Set the hand equipped component.
    this.component.createByteTag({
      name: "value",
      value: value ? 1 : 0
    });
  }
}

export { ItemTypeHandEquippedComponent };
