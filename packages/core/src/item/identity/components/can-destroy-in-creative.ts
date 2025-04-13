import { ByteTag } from "@serenityjs/nbt";

import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeCanDestroyInCreativeComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:can_destroy_in_creative";

  /**
   * Create a new can destroy in creative component for an item type.
   * @param type The item type that the component will be attached to.
   * @param value Whether the item type can destroy blocks in creative mode.
   * @returns A new can destroy in creative component.
   */
  public constructor(type: ItemType, value?: boolean) {
    super(type);

    // Assign the can destroy in creative value.
    this.setCanDestroyInCreative(value ?? true);
  }

  public getCanDestroyInCreative(): boolean {
    // Get the can destroy in creative component.
    const component = this.component.getTag<ByteTag>(this.identifier);

    // Return the can destroy in creative value.
    return component?.value === 1;
  }

  public setCanDestroyInCreative(value: boolean): void {
    // Set the can destroy in creative component.
    this.component.createByteTag({
      name: this.identifier,
      value: value ? 1 : 0
    });
  }
}

export { ItemTypeCanDestroyInCreativeComponent };
