import { IntTag, StringTag } from "@serenityjs/nbt";
import { WearableSlot } from "@serenityjs/protocol";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeWearableComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:wearable";

  /**
   * The amount of protection that the wearable item provides.
   */
  public get protection(): number {
    return this.component.getTag<IntTag>("protection")?.value as number;
  }

  /**
   * The amount of protection that the wearable item provides.
   */
  public set protection(value: number) {
    this.component.createIntTag({ name: "protection", value });
  }

  /**
   * The slot that the wearable item can be equipped in.
   */
  public get slot(): WearableSlot {
    return this.component.getTag<StringTag>("slot")?.value as WearableSlot;
  }

  /**
   * The slot that the wearable item can be equipped in.
   */
  public set slot(value: WearableSlot) {
    this.component.createStringTag({ name: "slot", value });
  }

  /**
   * Creates a new wearable component definition for an item type.
   * @param type The type of item that the component is for.
   * @param properties The properties of the wearable component.
   */
  public constructor(
    type: ItemType,
    properties?: Partial<ItemTypeWearableComponent>
  ) {
    super(type);

    // Assign the default properties.
    this.protection = properties?.protection ?? 0;
    this.slot = properties?.slot ?? WearableSlot.Offhand;
  }
}

export { ItemTypeWearableComponent };
