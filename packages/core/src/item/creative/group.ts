import {
  CreativeItemCategory,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";

import { ItemType } from "../identity";
import { ItemIdentifier } from "../../enums";

import { CreativeItemDescriptor } from "./descriptor";

const DefaultCreativeGroupProperties: Partial<CreateContentGroup> = {
  identifier: "",
  category: CreativeItemCategory.All,
  icon: ItemType.get(ItemIdentifier.Air)!
};

class CreateContentGroup {
  /**
   * A collective registry of all creative groups.
   */
  public static readonly groups = new Map<number, CreateContentGroup>();

  /**
   * The identifier of the creative group.
   */
  public readonly identifier: string;

  /**
   * The type of the creative group.
   */
  public readonly category: CreativeItemCategory;

  /**
   * The icon item type of the creative group.
   */
  public readonly icon: ItemType;

  /**
   * The items of the creative group.
   */
  public readonly items = new Set<CreativeItemDescriptor>();

  /**
   * Creates a new creative group.
   * @param properties The properties of the creative group.
   */
  public constructor(properties?: Partial<CreateContentGroup>) {
    // Set the default properties of the creative group.
    properties = { ...DefaultCreativeGroupProperties, ...properties };

    // Assign the properties of the creative group.
    this.identifier = properties.identifier ?? "";
    this.category = properties.category ?? CreativeItemCategory.All;
    this.icon = properties.icon ?? ItemType.get(ItemIdentifier.Air)!;
  }

  /**
   * Checks if the creative group has an item.
   * @param item The item to check.
   * @returns True if the creative group has the item, false otherwise.
   */
  public hasItem(item: ItemType): boolean {
    return [...this.items].some((descriptor) => descriptor.type === item);
  }

  /**
   * Registers an item to the creative group.
   * @param item The item to register.
   * @param descriptor The network item instance descriptor, if applicable.
   */
  public registerItem(
    type: ItemType,
    descriptor?: NetworkItemInstanceDescriptor
  ): CreativeItemDescriptor {
    // Create a new creative item descriptor.
    const instance = new CreativeItemDescriptor(type, descriptor);

    // Register the item to the creative group.
    this.items.add(instance);

    // Return the registered item.
    return instance;
  }

  /**
   * Unregisters an item from the creative group.
   * @param item The item to unregister.
   */
  public unregisterItem(item: CreativeItemDescriptor | ItemType): void {
    // Unregister the item from the creative group.
    if (item instanceof CreativeItemDescriptor) {
      this.items.delete(item);
    } else {
      // Delete the items that match the item type.
      this.items.delete(
        [...this.items].find((descriptor) => descriptor.type === item)!
      );
    }
  }
}

export { CreateContentGroup };
