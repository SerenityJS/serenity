import { IntTag, StringTag } from "@serenityjs/nbt";
import { WearableSlot } from "@serenityjs/protocol";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeWearableComponentOptions {
  /**
   * The protection value of the wearable component.
   */
  protection: number;

  /**
   * The wearable slot of the component.
   */
  slot: WearableSlot;
}

class ItemTypeWearableComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:wearable";

  /**
   * Creates a new wearable component definition for an item type.
   * @param type The type of item that the component is for.
   * @param options The options for the component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeWearableComponentOptions>
  ) {
    super(type);

    // Assign the default properties.
    this.setProtection(options?.protection ?? 0);
    this.setWearableSlot(options?.slot ?? WearableSlot.Offhand);
  }

  /**
   * Get the protection value of the wearable component.
   * @returns The protection value of the wearable component.
   */
  public getProtection(): number {
    // Get the protection component.
    const component = this.component.getTag<IntTag>(this.identifier);

    // Return the protection value.
    return component?.value ?? 0;
  }

  /**
   * Set the protection value of the wearable component.
   * @param value The protection value of the wearable component.
   */
  public setProtection(value: number): void {
    // Set the protection component.
    this.component.createIntTag({ name: this.identifier, value });
  }

  /**
   * Get the wearable slot of the component.
   * @returns The wearable slot of the component.
   */
  public getWearableSlot(): WearableSlot {
    // Get the wearable slot component.
    const component = this.component.getTag<StringTag>(this.identifier);

    // Return the wearable slot.
    return component?.value as WearableSlot;
  }

  /**
   * Set the wearable slot of the component.
   * @param value The wearable slot of the component.
   */
  public setWearableSlot(value: WearableSlot): void {
    // Set the wearable slot component.
    this.component.createStringTag({ name: this.identifier, value });
  }
}

export { ItemTypeWearableComponent, ItemTypeWearableComponentOptions };
