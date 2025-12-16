import { CREATIVE_GROUPS, CREATIVE_CONTENT } from "@serenityjs/data";
import {
  CreativeItemCategory,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";

import { ItemType } from "../identity";
import { ItemIdentifier } from "../../enums";
import { ItemStack } from "../stack";

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

  // Register the creative groups & content.
  static {
    // Iterate over the creative groups
    for (const group of CREATIVE_GROUPS) {
      // Get the category and name of the group.
      const { category, name } = group;

      // Get the icon item type from the map.
      const icon = ItemType.get(group.icon as ItemIdentifier);
      if (!icon) continue; // If not, then continue to the next group.

      // Create a new creative group.
      const instance = new this({
        identifier: name,
        category,
        icon
      });

      // Get the index of the creative group.
      const index = this.groups.size;

      // Register the creative group.
      this.groups.set(index, instance);
    }

    // Iterate over the creative content.
    for (const { type, groupIndex, instance } of CREATIVE_CONTENT) {
      // Get the group from the index.
      const group = this.groups.get(groupIndex);
      if (!group) continue; // If not, then continue to the next content.

      // Get the item type from the map.
      const item = ItemType.get(type as ItemIdentifier);
      if (!item) continue; // If not, then continue to the next content.

      // Assign the creative category and group to the item.
      item.creativeCategory = group.category;
      item.creativeGroup = group.identifier;

      // Create a new stream from the content instance.
      const stream = new BinaryStream(Buffer.from(instance, "base64"));
      const descriptor = NetworkItemInstanceDescriptor.read(stream);

      // Register the item to the group.
      group.registerItem(item, descriptor);
    }
  }

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
    type: ItemType | ItemStack,
    descriptor?: NetworkItemInstanceDescriptor
  ): CreativeItemDescriptor {
    // Check if the item is an item stack.
    if (type instanceof ItemStack) {
      // Create a new creative item descriptor.
      const instance = new CreativeItemDescriptor(
        type.type,
        descriptor ?? ItemStack.toNetworkInstance(type),
        type.getStorage()
      );

      // Register the item to the creative group.
      this.items.add(instance);

      // Return the registered item.
      return instance;
    } else {
      // Create a new creative item descriptor.
      const instance = new CreativeItemDescriptor(type, descriptor);

      // Register the item to the creative group.
      this.items.add(instance);

      // Return the registered item.
      return instance;
    }
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
