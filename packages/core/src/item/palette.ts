import { CreativeItemCategory, CreativeItemGroup } from "@serenityjs/protocol";

import { ItemEnum } from "../commands";
import { ItemIdentifier } from "../enums";

import { CustomItemType, ItemType } from "./identity";
import { CreateContentGroup, CreativeItemDescriptor } from "./creative";

import { ItemStackTraits } from "./index";

import type { ItemStackTrait } from "./traits";
import type { BlockType } from "../block";

class ItemPalette {
  /**
   * The registered item types for the palette.
   */
  public readonly types = ItemType.types;

  /**
   * The creative content for the palette.
   */
  public readonly creativeGroups = CreateContentGroup.groups;

  /**
   * The registered item traits for the palette.
   */
  public readonly traits = new Map<string, typeof ItemStackTrait>();

  public constructor() {
    // Register all item traits.
    this.registerTrait(...ItemStackTraits);
  }

  /**
   * Gets all item types from the palette.
   * @returns All item types from the palette.
   */
  public getAllTypes(): Array<ItemType> {
    return [...this.types.values()];
  }

  public getAllCustomTypes(): Array<CustomItemType> {
    return this.getAllTypes().filter((type) => type instanceof CustomItemType);
  }

  /**
   * Gets an item type from the palette.
   * @param identifier The item identifier to get.
   * @returns The item type from the palette.
   */
  public getType(identifier: ItemIdentifier): ItemType | null {
    return this.types.get(identifier) ?? null;
  }

  /**
   * Resolves an item type from the block type.
   * @param type The block type to resolve.
   * @returns The item type from the palette.
   */
  public resolveType(type: BlockType): ItemType | null {
    return (
      [...this.types.values()].find((item) => {
        // Check if the item type is a block placer component.
        if (!item.components.hasBlockPlacer()) return false;

        // Get the block placer component from the item type.
        const blockPlacer = item.components.getBlockPlacer();

        // Check if the block placer component is not null.
        return blockPlacer.getBlockType() === type;
      }) ?? null
    );
  }

  public registerType(...types: Array<ItemType>): this {
    // Iterate over the provided types.
    for (const type of types) {
      // Check if the item type is already registered.
      if (this.types.has(type.identifier)) continue;

      // Register the item type.
      this.types.set(type.identifier, type);

      // Add the item type to the item enum.
      ItemEnum.options.push(type.identifier);

      // Check if the item type has a creative category.
      if (
        type.creativeCategory !== CreativeItemCategory.Undefined &&
        type.creativeGroup.length > 0
      ) {
        // Get the creative group for the item type.
        // And create a new creative content group if it doesn't exist.
        let creativeGroup = this.getCreativeGroup(type.creativeGroup);
        if (!creativeGroup) {
          // Create a new creative content group.
          creativeGroup = this.createContentGroup({
            identifier: type.creativeGroup,
            category: type.creativeCategory,
            icon: type
          });
        }

        // Register the item type to the creative group.
        if (!creativeGroup.hasItem(type)) creativeGroup.registerItem(type);
      }

      // Iterate over the item traits of the palette.
      for (const [, trait] of this.traits) {
        // Check if the item type has the trait.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the item type.
          type.registerTrait(trait);
        }

        // Check if the trait has a tag and the item type has the tag.
        else if (trait.tag && type.hasTag(trait.tag)) {
          // Register the trait to the item type.
          type.registerTrait(trait);
        }

        // Check if the trait has components, and the item type has the components.
        else if (trait.components.length > 0) {
          // Iterate over the components of the trait.
          for (const component of trait.components) {
            // Check if the item type has the component.
            if (type.components.has(component)) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          }
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Register an item trait to the palette.
   * @param trait The item trait to register.
   * @returns True if the item trait was registered, false otherwise.
   */
  public registerTrait(...traits: Array<typeof ItemStackTrait>): this {
    // Iterate over the provided traits.
    for (const trait of traits) {
      // Check if the item trait is already registered.
      if (this.traits.has(trait.identifier)) continue;

      // Register the item trait.
      this.traits.set(trait.identifier, trait);

      // Iterate over the item types.
      for (const [, type] of this.types) {
        // Check if the trait contains the item type.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the item type.
          type.registerTrait(trait);
        }

        // Check if the trait has a tag and the item type has the tag.
        else if (trait.tag && type.hasTag(trait.tag)) {
          // Register the trait to the item type.
          type.registerTrait(trait);
        }

        // Check if the trait has components and the item type has the components.
        else if (trait.components.length > 0) {
          // Iterate over the components of the trait.
          for (const component of trait.components) {
            // Check if the item type has the component.
            if (type.components.has(component)) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          }
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Unregister an item trait from the palette.
   * @param types The item trait to unregister, or the identifier of the item trait.
   * @returns The item palette instance.
   */
  public unregisterTrait(
    ...types: Array<string | typeof ItemStackTrait>
  ): this {
    // Iterate over the provided types.
    for (const type of types) {
      // Get the identifier of the type.
      const identifier = typeof type === "string" ? type : type.identifier;

      // Check if the item trait is not registered.
      if (!this.traits.has(identifier)) continue;

      // Get the item trait.
      const trait = this.traits.get(identifier) as typeof ItemStackTrait;

      // Iterate over the item types.
      for (const [, itemType] of this.types) {
        // Check if the item type has the trait.
        if (itemType.traits.has(identifier)) {
          // Unregister the trait from the item type.
          itemType.unregisterTrait(trait);
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Gets all item traits from the palette.
   * @returns
   */
  public getAllTraits(): Array<typeof ItemStackTrait> {
    return [...this.traits.values()];
  }

  /**
   * Gets an item trait from the palette.
   * @param identifier The identifier of the item trait.
   * @returns The item trait from the palette.
   */
  public getTrait(identifier: string): typeof ItemStackTrait | null {
    return this.traits.get(identifier) ?? null;
  }

  /**
   * Create a new creative content group.
   * @param properties The properties of the creative content group.
   * @returns The creative content group.
   */
  public createContentGroup(
    properties?: Partial<CreateContentGroup>
  ): CreateContentGroup {
    // Create a new creative content group.
    const group = new CreateContentGroup(properties);

    // Register the creative content group.
    this.registerCreativeGroup(group);

    // Return the creative content group.
    return group;
  }

  /**
   * Get a creative content group from the palette.
   * @param value The index or identifier of the creative content group.
   * @returns The creative content group from the palette, or null if not found.
   */
  public getCreativeGroup(
    value: number | string | CreativeItemGroup
  ): CreateContentGroup | null {
    // Check if the index is a number.
    if (typeof value === "number") {
      // Get the creative group by index.
      return this.creativeGroups.get(value) ?? null;
    }

    // Get the creative group by identifier.
    return (
      [...this.creativeGroups.values()].find(
        (group) => group.identifier === value
      ) ?? null
    );
  }

  /**
   * Register a creative group to the palette.
   * @param group The creative group to register.
   * @returns True if the creative group was registered, false otherwise.
   */
  public registerCreativeGroup(group: CreateContentGroup): boolean {
    // Check if the creative group is already registered with the identifier.
    if (this.getCreativeGroup(group.identifier)) return false;

    // Get the next index for the creative group.
    const index = this.creativeGroups.size;

    // Register the creative group.
    this.creativeGroups.set(index, group);

    // Return true if the creative group was registered.
    return true;
  }

  /**
   * Unregister a creative group from the palette.
   * @param value The index or identifier of the creative group to unregister.
   */
  public unregisterCreativeGroup(value: number | string): void {
    // Check if the index is a number.
    if (typeof value === "number") {
      // Unregister the creative group by index.
      this.creativeGroups.delete(value);
    } else {
      // Get the creative group by identifier.
      const group = this.getCreativeGroup(value);

      // Find the index of the creative group.
      const index = [...this.creativeGroups.entries()].findIndex(
        ([, g]) => g === group
      );

      // Unregister the creative group by index.
      this.creativeGroups.delete(index);
    }
  }

  /**
   * Get creative content by index.
   * @param index The index of the creative content.
   * @returns The creative content by index.
   */
  public getCreativeContentByIndex(
    index: number
  ): CreativeItemDescriptor | null {
    // Prepare the running index.
    let runningIndex = 0;

    // Iterate over the creative groups.
    for (const group of this.creativeGroups.values()) {
      // Iterate over the items in the group.
      for (const item of group.items) {
        // Check if the running index is equal to the index.
        if (runningIndex === index) return item;

        // Increment the running index.
        runningIndex++;
      }
    }

    // Return null if the creative content was not found.
    return null;
  }

  /**
   * Register an item for a creative content group.
   * @param group The creative content group.
   * @param type The item type to register.
   * @returns The creative content group.
   */
  public registerItemForCreativeGroup(
    group: CreativeItemGroup,
    type: ItemType
  ): void {
    // Get the creative content group.
    const contentGroup = this.getCreativeGroup(group);

    // Check if the content group exists.
    if (!contentGroup) return;

    // Add the item to the creative content group.
    contentGroup.registerItem(type);
  }
}

export { ItemPalette };
