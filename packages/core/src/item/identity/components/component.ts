import { CompoundTag } from "@serenityjs/nbt";

import { ItemTypeComponentCollection } from "../collection";
import { ItemType } from "../type";

class ItemTypeComponent {
  /**
   * The component identifier of the item type.
   */
  public static readonly identifier: string;

  /**
   * The component identifier of the item type.
   */
  public readonly identifier = (this.constructor as typeof ItemTypeComponent)
    .identifier;

  /**
   * The component collection of the item type.
   */
  protected readonly collection: ItemTypeComponentCollection;

  /**
   * The item type of the component.
   */
  protected readonly type: ItemType;

  /**
   * The component value of the item type.
   */
  protected get component(): CompoundTag {
    return this.collection.get<CompoundTag>(this.identifier) as CompoundTag;
  }

  /**
   * Create a new item type component definition.
   * @param type The item type of the component.
   * @param args Additional arguments for the component.
   * @returns The item type component definition.
   */
  public constructor(type: ItemType, ..._args: Array<unknown>) {
    // Assign the properties of the component.
    this.type = type;
    this.collection = type.components;

    // Create a new compound tag for the component.
    this.collection.add(new CompoundTag(this.identifier));

    // Add the component to the collection, if it doesn't already exist.
    if (!this.collection.components.has(this.identifier))
      this.collection.components.set(this.identifier, this);
  }
}

export { ItemTypeComponent };
