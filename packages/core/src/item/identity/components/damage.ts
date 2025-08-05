import { ByteTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeDamageComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:damage";
  /**
   * Create a new damage component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The damage of the item type.
   */
  public constructor(type: ItemType, value?: number) {
    super(type);

    // Assign the damage value.
    this.setDamage(value ?? 1);
  }

  /**
   * Get the damage of the item type.
   * @returns The damage of the item type.
   */
  public getDamage(): number {
    // Get the damage component.
    const component = this.component.get<ByteTag>("value");

    // Return the damage.
    return component?.valueOf() ?? 1;
  }

  /**
   * Set the damage of the item type.
   * @param value The damage of the item type.
   */
  public setDamage(value: number): void {
    // Set the damage component.
    this.component.add(new ByteTag(value, "value"));
  }
}

export { ItemTypeDamageComponent };
