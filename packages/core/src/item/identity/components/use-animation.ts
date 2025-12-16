import { StringTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeUseAnimationComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:use_animation";
  /**
   * Create a new use animation component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value The use animation of the item type.
   */
  public constructor(type: ItemType, value?: string) {
    super(type);

    // Assign the use animation value.
    this.setUseAnimation(value ?? "none");
  }

  /**
   * Get the use animation of the item type.
   * @returns The use animation of the item type.
   */
  public getUseAnimation(): string {
    // Get the use animation component.
    const component = this.component.get<StringTag>("value");

    // Return the use animation.
    return component?.valueOf() ?? "";
  }

  /**
   * Set the use animation of the item type.
   * @param value The use animation of the item type.
   */
  public setUseAnimation(value: string): void {
    // Set the use animation component.
    this.component.add(new StringTag(value, "value"));
  }
}

export { ItemTypeUseAnimationComponent };
