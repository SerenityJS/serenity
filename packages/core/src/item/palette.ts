import { ItemIdentifier } from "../enums";
import { Items } from "../types";
import { ItemEnum } from "../commands";

import { CreativeItem, CustomItemType, ItemTraits, ItemType } from ".";

import type { ItemTrait } from "./traits";
import type { BlockType } from "../block";

class ItemPalette {
  /**
   * The registered item types for the palette.
   */
  public readonly types = ItemType.types;

  /**
   * The creative content for the palette.
   */
  public readonly creativeContent = CreativeItem.items;

  /**
   * The registered item traits for the palette.
   */
  public readonly traits = new Map<string, typeof ItemTrait>();

  /**
   * The registry for the item traits.
   */
  public readonly registry = new Map<ItemIdentifier, Array<typeof ItemTrait>>();

  public constructor() {
    // Register all item traits.
    for (const trait of ItemTraits) this.registerTrait(trait);
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
  public getType<T extends keyof Items>(identifier: T): ItemType<T> | null {
    return this.types.get(identifier) as ItemType<T>;
  }

  /**
   * Resolves an item type from the block type.
   * @param type The block type to resolve.
   * @returns The item type from the palette.
   */
  public resolveType(type: BlockType): ItemType | null {
    return [...this.types.values()].find((item) => item.block === type) ?? null;
  }

  public registerType(type: ItemType): boolean {
    // Check if the item type is already registered.
    if (this.types.has(type.identifier)) return false;

    // Register the item type.
    this.types.set(type.identifier, type);

    // Add the item type to the item enum.
    ItemEnum.options.push(type.identifier);

    // Return true if the item type was registered.
    return true;
  }

  public getRegistry(identifier: ItemIdentifier): Array<typeof ItemTrait> {
    // Get the registry for the item identifier.
    const registry = this.registry.get(identifier);

    // Return the registry for the item identifier.
    return registry ?? [];
  }

  /**
   * Gets all creative content from the palette.
   * @returns All creative content from the palette.
   */
  public getCreativeContent(): Array<CreativeItem> {
    return [...this.creativeContent.values()];
  }

  /**
   * Get creative content by index.
   * @param index The index of the creative content.
   * @returns The creative content by index.
   */
  public getCreativeContentByIndex(index: number): CreativeItem | null {
    return this.creativeContent.get(index) ?? null;
  }

  /**
   * Register a new creative item.
   * @param type The item type to register.
   * @param auxillary The auxillary data for the item.
   */
  public registerCreativeContent(type: ItemType, auxillary = 0): void {
    // TODO: Add NBT support

    // Get the index for the creative item.
    const index = this.creativeContent.size;

    // Set the creative item in the registry.
    this.creativeContent.set(index, new CreativeItem(type, auxillary));
  }

  /**
   * Unregister a creative item from the palette.
   * @param index The index of the creative item to unregister.
   */
  public unregisterCreativeContent(index: number): void {
    this.creativeContent.delete(index);
  }

  /**
   * Clear all creative content from the palette.
   */
  public clearCreativeContent(): void {
    this.creativeContent.clear();
  }

  /**
   * Register an item trait to the palette.
   * @param trait The item trait to register.
   * @returns True if the item trait was registered, false otherwise.
   */
  public registerTrait(trait: typeof ItemTrait): boolean {
    // Check if the item trait is already registered.
    if (this.traits.has(trait.identifier)) return false;

    // Register the item trait.
    this.traits.set(trait.identifier, trait);

    // Iterate over the item types.
    for (const type of trait.types) {
      // Check if the registry has the item identifier.
      if (!this.registry.has(type))
        // Set the registry for the item identifier.
        this.registry.set(type, []);

      // Get the registry for the item identifier.
      const registry = this.registry.get(type);

      // Check if the registry exists.
      if (registry) {
        // Push the trait to the registry.
        registry.push(trait);

        // Set the registry for the item identifier.
        this.registry.set(type, registry);
      }
    }

    // Return true if the item trait was registered.
    return true;
  }

  /**
   * Gets all item traits from the palette.
   * @returns
   */
  public getAllTraits(): Array<typeof ItemTrait> {
    return [...this.traits.values()];
  }

  /**
   * Gets an item trait from the palette.
   * @param identifier The identifier of the item trait.
   * @returns The item trait from the palette.
   */
  public getTrait(identifier: string): typeof ItemTrait | null {
    return this.traits.get(identifier) ?? null;
  }
}

export { ItemPalette };
