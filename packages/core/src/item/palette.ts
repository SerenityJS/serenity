import {
  CraftingDataEntryType,
  CraftingDataPacket,
  CreativeContentPacket,
  CreativeGroup,
  CreativeItem,
  CreativeItemCategory,
  CreativeItemGroup,
  ItemData,
  ItemRegistryPacket
} from "@serenityjs/protocol";
import { CompoundTag } from "@serenityjs/nbt";

import { ItemEnum } from "../commands";
import { ItemIdentifier } from "../enums";

import { CustomItemType, ItemType } from "./identity";
import { CreateContentGroup, CreativeItemDescriptor } from "./creative";
import {
  Recipe,
  ShapedCraftingRecipe,
  ShapelessCraftingRecipe
} from "./recipes";

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

  /**
   * The registered recipes for the palette.
   */
  public readonly recipes = Recipe.recipes;

  /**
   * The cached item registry packet.
   */
  private itemRegistryCache: ItemRegistryPacket | null = null;

  /**
   * The cached creative content packet.
   */
  private creativeContentCache: CreativeContentPacket | null = null;

  /**
   * The cached crafting recipes packet.
   */
  private craftingRecipesCache: CraftingDataPacket | null = null;

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
  public getType(identifier: ItemIdentifier | string): ItemType | null {
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
        if (trait.tag) {
          // Check if the trait tag is a string or an array.
          if (typeof trait.tag === "string") {
            // Check if the item type has the tag.
            if (type.hasTag(trait.tag)) type.registerTrait(trait);
          } else {
            // Check if the item type has any of the tags.
            if (trait.tag.some((tag) => type.hasTag(tag))) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          }
        }

        // Check if the trait has components, and the item type has the components.
        if (trait.component) {
          // Check if the trait component is a object or an array.
          if (typeof trait.component === "function") {
            // Check if the item type has the component.
            if (type.components.hasComponent(trait.component)) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          } else {
            // Check if the item type has any of the components.
            if (
              trait.component.some((component) =>
                type.components.hasComponent(component)
              )
            ) {
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
   * Gets the item registry packet.
   * @returns The item registry packet.
   */
  public getItemRegistry(): ItemRegistryPacket {
    // Check if the item registry cache is not null.
    if (this.itemRegistryCache) return this.itemRegistryCache;

    // Create a new ItemRegistryPacket, and map the item types to the packet
    const registry = new ItemRegistryPacket();
    registry.definitions = [...this.types.values()].map((item) => {
      const identifier = item.identifier;
      const networkId = item.network;
      const componentBased = item.getIsComponentBased();
      const itemVersion = item.getVersion();
      const properties = item.getIsComponentBased()
        ? item.properties
        : new CompoundTag();

      return new ItemData(
        identifier,
        networkId,
        componentBased,
        itemVersion,
        properties
      );
    });

    // Serialize the item registry packet to a buffer
    registry.serialize();

    // Cache the item registry packet
    this.itemRegistryCache = registry;

    // Return the item registry cache
    return this.itemRegistryCache;
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
        if (trait.tag) {
          // Check if the trait tag is a string or an array.
          if (typeof trait.tag === "string") {
            // Register the trait to the item type.
            if (type.hasTag(trait.tag)) type.registerTrait(trait);
          } else {
            // Check if the item type has any of the tags.
            if (trait.tag.some((tag) => type.hasTag(tag))) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          }
        }

        // Check if the trait has components and the item type has the components.
        if (trait.component) {
          // Check if the trait component is a object or an array.
          if (typeof trait.component === "function") {
            // Check if the item type has the component.
            if (type.components.hasComponent(trait.component)) {
              // Register the trait to the item type.
              type.registerTrait(trait);
            }
          } else {
            // Check if the item type has any of the components.
            if (
              trait.component.some((component) =>
                type.components.hasComponent(component)
              )
            ) {
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
    // Reset the creative content cache.
    this.creativeContentCache = null;

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

    // Reset the creative content cache.
    this.creativeContentCache = null;

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
    // Reset the creative content cache.
    this.creativeContentCache = null;

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

    // Reset the creative content cache.
    this.creativeContentCache = null;

    // Check if the content group exists.
    if (!contentGroup) return;

    // Add the item to the creative content group.
    contentGroup.registerItem(type);
  }

  /**
   * Get the creative content buffer.
   * @returns The creative content buffer.
   */
  public getCreativeContent(): CreativeContentPacket {
    // Check if the creative content cache is not null.
    if (this.creativeContentCache) return this.creativeContentCache;

    // Create a new CreativeContentPacket, and map the creative content to the packet
    const content = new CreativeContentPacket();

    // Prepare an array to store the creative items
    content.items = [];

    // Map the creative content to the packet
    content.groups = [...this.creativeGroups].map(([index, group]) => {
      // Iterate over the items in the group
      for (const { descriptor } of group.items) {
        // Get the next index for the item
        const itemIndex = content.items.length;

        // Create and push the creative item to the packet
        content.items.push(new CreativeItem(itemIndex, descriptor, index));
      }

      // Get the icon item type from the map
      const icon = ItemType.toNetworkInstance(group.icon);

      // Create a new creative group
      return new CreativeGroup(group.category, group.identifier, icon);
    });

    // Serialize the creative content packet to a buffer
    content.serialize();

    // Cache the creative content buffer
    this.creativeContentCache = content;

    // Return the creative content cache
    return this.creativeContentCache;
  }

  /**
   * Register a recipe to the palette.
   * @param recipe The recipe to register.
   */
  public registerRecipe(recipe: Recipe): void {
    // Check if the recipe is already registered.
    if (this.recipes.has(recipe.identifier)) return;

    // Clear the crafting recipes cache.
    this.craftingRecipesCache = null;

    // Register the recipe.
    this.recipes.set(recipe.identifier, recipe);
  }

  /**
   * Unregister a recipe from the palette.
   * @param recipe The recipe to unregister.
   */
  public unregisterRecipe(recipe: Recipe): void {
    // Check if the recipe is registered.
    if (!this.recipes.has(recipe.identifier)) return;

    // Clear the crafting recipes cache.
    this.craftingRecipesCache = null;

    // Unregister the recipe.
    this.recipes.delete(recipe.identifier);
  }

  /**
   * Get a recipe by its network ID.
   * @param networkId The network ID of the recipe to get.
   * @returns The recipe with the specified network ID, or null if not found.
   */
  public getRecipeByNetworkId(networkId: number): Recipe | null {
    // Find the recipe with the specified network ID.
    return (
      [...this.recipes.values()].find(
        (recipe) => recipe.recipeNetworkId === networkId
      ) ?? null
    );
  }

  public getCraftingRecipes(): CraftingDataPacket {
    // Check if the crafting recipes cache is not null.
    if (this.craftingRecipesCache) return this.craftingRecipesCache;

    // Create a new CraftingDataPacket, and map the crafting recipes to the packet
    const recipes = new CraftingDataPacket();

    // Assign the recipe properties
    recipes.clearRecipes = true;
    recipes.containers = [];
    recipes.crafting = [];
    recipes.materitalReducers = [];
    recipes.potions = [];

    // Iterate over the recipes in the item palette
    for (const [, recipe] of this.recipes) {
      // Check if the recipe is a ShapedCraftingRecipe
      if (recipe instanceof ShapelessCraftingRecipe) {
        // Convert the recipe to a network format
        const shapeless = ShapelessCraftingRecipe.toNetwork(recipe);

        // Iterate over the shapeless recipes and add them to the packet
        for (const recipe of shapeless) {
          // Add the recipe to the crafting data packet
          recipes.crafting.push({
            type: CraftingDataEntryType.ShapelessRecipe,
            recipe
          });
        }
      } else if (recipe instanceof ShapedCraftingRecipe) {
        // Convert the recipe to a network format
        const shaped = ShapedCraftingRecipe.toNetwork(recipe);

        // Iterate over the shaped recipes and add them to the packet
        for (const recipe of shaped) {
          // Add the recipe to the crafting data packet
          recipes.crafting.push({
            type: CraftingDataEntryType.ShapedRecipe,
            recipe
          });
        }
      }
    }

    // Serialize the crafting data packet to a buffer
    recipes.serialize();

    // Cache the crafting recipes buffer
    this.craftingRecipesCache = recipes;

    // Return the crafting recipes cache
    return this.craftingRecipesCache;
  }
}

export { ItemPalette };
