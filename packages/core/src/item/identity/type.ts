import { CompoundTag, IntTag, ListTag, StringTag } from "@serenityjs/nbt";
import {
  CreativeItemCategory,
  CreativeItemGroup,
  NetworkItemInstanceDescriptor,
  NetworkItemStackDescriptor
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { ITEM_METADATA, ITEM_TYPES } from "@serenityjs/data";

import { ItemIdentifier, ItemTypeToolTier } from "../../enums";
import { BlockType } from "../../block";

import { ItemTypeComponents } from "./components";
import { ItemTypeComponentCollection } from "./collection";

import type { ItemStackTrait } from "../traits";
import type { ItemTypeOptions } from "../types";

class ItemType {
  /**
   * A collective registry of all item types.
   */
  public static readonly types = new Map<string, ItemType>();

  public static AIR: ItemType;

  // Register all the item types.
  static {
    // Iterate over the item types.
    for (const type of ITEM_TYPES) {
      // Get the metadata for the item type.
      const metadata = ITEM_METADATA.find(
        (metadata) => metadata.identifier === type.identifier
      );

      // Check if the metadata exists.
      if (!metadata) continue; // If not, then continue to the next item type.

      // Get the block type for the item type.
      const blockType = BlockType.types.get(type.identifier);

      const stream = new BinaryStream(
        Buffer.from(metadata.properties, "base64")
      );
      const properties = CompoundTag.read(stream);

      // Create the item type.
      const instance = new ItemType(
        type.identifier as ItemIdentifier,
        metadata.networkId,
        {
          properties,
          blockType,
          isComponentBased: metadata.isComponentBased,
          version: metadata.itemVersion,
          maxStackSize: type.maxAmount,
          tags: type.tags ?? []
        }
      );

      // Iterate over the item type components.
      for (const component of ItemTypeComponents) {
        // Get the component definition from the item type.
        const definition = instance.components.get(component.identifier);

        // Check if the component definition exists and if the item type does not already have the component.
        if (definition && !instance.components.hasComponent(component)) {
          // Create a new component instance from the definition.
          const compInstance = component.from(instance, definition);

          // Register the component instance to the item type.
          instance.components.components.set(
            compInstance.identifier,
            compInstance
          );
        }
      }

      // Add the item type to the map.
      this.types.set(instance.identifier, instance);
    }

    // Set the AIR item type.
    this.AIR = this.types.get("minecraft:air")!;
  }

  /**
   * The identifier of the item type.
   */
  public readonly identifier: ItemIdentifier | string;

  /**
   * The network of the item type.
   */
  public readonly network: number;

  /**
   * The nbt properties definition of the item type.
   * This contains the vanilla component definitions.
   */
  public readonly properties: CompoundTag;

  /**
   * The traits that are bound to the item type.
   * These traits are used to define custom behavior for the item type.
   */
  public readonly traits = new Map<string, typeof ItemStackTrait>();

  /**
   * The version of the item type.
   * The version also corresponds if the item type is component based or not.
   */
  private version: number = 1;

  /**
   * Whether the item type is component based.
   */
  private isComponentBased: boolean;

  public creativeCategory: CreativeItemCategory;

  public creativeGroup: CreativeItemGroup | string;

  /**
   * Whether the item type is stackable.
   */
  public get isStackable(): boolean {
    return this.components.getMaxStackSize() > 1;
  }

  /**
   * The vanilla components of the item type.
   */
  public get components(): ItemTypeComponentCollection {
    // Check if the item type contains the components tag.
    if (this.properties.has("components")) {
      // Get the components tag from the item type.
      const components = this.properties.get<CompoundTag>("components");

      // Check if the components is instance of the component collection.
      if (components instanceof ItemTypeComponentCollection) return components;

      // Create the new component collection.
      const collection = new ItemTypeComponentCollection(this);

      // Assign the components to the collection.
      collection.push(...(components?.values() ?? []));

      // Set the components tag to the item type.
      this.properties.set("components", collection);

      // Return the component collection.
      return collection;
    }

    // Create the new component collection.
    const components = new ItemTypeComponentCollection(this);

    // Add the components tag to the item type.
    this.properties.add(components);

    // Return the components collection.
    return components;
  }

  /**
   * Create a new item type.
   * @param identifier The identifier of the item type.
   * @param network The network of the item type.
   * @param properties The properties of the item type.
   */
  public constructor(
    identifier: ItemIdentifier | string,
    network: number,
    properties?: Partial<ItemTypeOptions>
  ) {
    // Assign the identifier and network of the item type.
    this.identifier = identifier;
    this.network = network;

    // Assign the properties of the item type first.
    // As this will be used to define the item type.
    this.properties = properties?.properties ?? new CompoundTag();

    // Create a new tag for item identifier and network.
    this.properties.add(new IntTag(this.network, "id"));
    this.properties.add(new StringTag(this.identifier, "name"));

    // Assign the properties of the item type.
    this.version = properties?.version ?? 1;
    this.setTags(properties?.tags ?? []);
    this.isComponentBased = properties?.isComponentBased ?? true;

    // Assign the creative properties of the item type.
    this.creativeCategory =
      properties?.creativeCategory ?? CreativeItemCategory.Undefined;
    this.creativeGroup =
      properties?.creativeGroup ?? `itemGroup.name.${identifier}`;

    // Assign the component based properties of the item type.
    this.components.setMaxStackSize(properties?.maxStackSize ?? 64);
    this.components.setBlockPlacer({ blockType: properties?.blockType });
  }

  /**
   * Get whether the item type is component based.
   * @returns True if the item type is component based, false otherwise.
   */
  public getIsComponentBased(): boolean {
    return this.isComponentBased;
  }

  /**
   * Set whether the item type is component based.
   * @param value True to set the item type as component based, false otherwise.
   */
  public setIsComponentBased(value: boolean): void {
    this.isComponentBased = value;
    this.version = value ? 1 : 2;
  }

  /**
   * Get the version of the item type.
   * @returns The version of the item type.
   */
  public getVersion(): number {
    return this.version;
  }

  /**
   * Set the version of the item type.
   * @param version The version to set.
   */
  public setVersion(version: number): void {
    this.version = version;
    this.isComponentBased = version >= 1;
  }

  /**
   * Register a trait to the item type.
   * @param trait The trait to register.
   * @returns The item type instance.
   */
  public registerTrait(trait: typeof ItemStackTrait): this {
    // Check if the trait is already registered.
    if (this.traits.has(trait.identifier)) return this;

    // Add the trait to the item type.
    this.traits.set(trait.identifier, trait);

    // Return this instance.
    return this;
  }

  /**
   * Unregister a trait from the item type.
   * @param trait The trait to unregister, or the identifier of the trait.
   * @returns The item type instance.
   */
  public unregisterTrait(trait: string | typeof ItemStackTrait): this {
    // Get the identifier of the trait.
    const identifier = typeof trait === "string" ? trait : trait.identifier;

    // Check if the trait is not registered.
    if (!this.traits.has(identifier)) return this;

    // Remove the trait from the item type.
    this.traits.delete(identifier);

    // Return this instance.
    return this;
  }

  /**
   * Get the tags of the item type.
   * @returns The tags of the item type.
   */
  public getTags(): Array<string> {
    // Check if the item type contains the item tags component.
    if (!this.components.has("item_tags")) {
      // Create a new item tags component if it does not exist.
      const itemTags = new ListTag<StringTag>([], "item_tags");

      // Add the item tags component to the item type.
      this.components.add(itemTags);
    }

    // Get the item tags component from the item type.
    const itemTags = this.components.get<ListTag<StringTag>>("item_tags") ?? [];

    // Map the item tags be strings.
    return itemTags.map((tag) => tag.valueOf());
  }

  /**
   * Set the tags of the item type.
   * @param tags The tags to set.
   * @returns The item type instance.
   */
  public setTags(tags: Array<string>): this {
    // Create a new list tag for the item tags.
    const itemTags = new ListTag<StringTag>([], "item_tags");

    // Iterate over the tags and add them to the item tags component.
    for (const tag of tags) itemTags.push(new StringTag(tag));

    // Set the item tags component to the item type.
    this.components.set("item_tags", itemTags);

    // Return this instance.
    return this;
  }

  /**
   * Add a tag to the item type.
   * @param tags The tags to add.
   * @returns The item type instance.
   */
  public addTag(...tags: Array<string>): this {
    // Check if the item type contains the item tags component.
    if (!this.components.has("item_tags")) {
      // Create a new item tags component if it does not exist.
      const itemTags = new ListTag<StringTag>([], "item_tags");

      // Add the item tags component to the item type.
      this.components.add(itemTags);
    }

    // Get the item tags component from the item type.
    const itemTags = this.components.get<ListTag<StringTag>>("item_tags")!;

    // Add the tags to the item type.
    for (const tag of tags) {
      // Check if the tag is not already in the item type.
      if (itemTags.some((t) => t.valueOf() === tag)) continue;

      // Add the tag to the item type.
      itemTags.push(new StringTag(tag));
    }

    // Return this instance.
    return this;
  }

  /**
   * Remove a tag from the item type.
   * @param tags The tags to remove.
   * @returns The item type instance.
   */
  public removeTag(...tags: Array<string>): this {
    // Check if the item type contains the item tags component.
    if (!this.components.has("item_tags")) {
      // Create a new item tags component if it does not exist.
      const itemTags = new ListTag<StringTag>([], "item_tags");

      // Add the item tags component to the item type.
      this.components.add(itemTags);
    }

    // Get the item tags component from the item type.
    const itemTags = this.components.get<ListTag<StringTag>>("item_tags")!;

    // Filter out the tags that are not in the item type.
    const newTags = itemTags.filter(
      (tag) => !tags.some((t) => t === tag.valueOf())
    );

    // Set the new tags to the item type.
    this.components.set("item_tags", new ListTag(newTags, "item_tags"));

    // Return this instance.
    return this;
  }

  /**
   * Check if the item type has a tag.
   * @param tag The tag to check.
   * @returns True if the item type has the tag, false otherwise.
   */
  public hasTag(tag: string): boolean {
    // Check if the item type contains the item tags component.
    return this.getTags().includes(tag);
  }

  /**
   * Whether the item type is a pickaxe.
   * @note This method evaluates if the item type contains the `minecraft:is_pickaxe` tag.
   * @returns True if the item type is a pickaxe, false otherwise.
   */
  public isPickaxe(): boolean {
    return this.getTags().includes("minecraft:is_pickaxe");
  }

  /**
   * Whether the item type is a axe.
   * @note This method evaluates if the item type contains the `minecraft:is_axe` tag.
   * @returns True if the item type is a axe, false otherwise.
   */
  public isAxe(): boolean {
    return this.getTags().includes("minecraft:is_axe");
  }

  /**
   * Whether the item type is a shovel.
   * @note This method evaluates if the item type contains the `minecraft:is_shovel` tag.
   * @returns True if the item type is a shovel, false otherwise.
   */
  public isShovel(): boolean {
    return this.getTags().includes("minecraft:is_shovel");
  }

  /**
   * Whether the item type is a hoe.
   * @note This method evaluates if the item type contains the `minecraft:is_hoe` tag.
   * @returns True if the item type is a hoe, false otherwise.
   */
  public isHoe(): boolean {
    return this.getTags().includes("minecraft:is_hoe");
  }

  /**
   * Whether the item type is a sword.
   * @note This method evaluates if the item type contains the `minecraft:is_sword` tag.
   * @returns True if the item type is a sword, false otherwise.
   */
  public isSword(): boolean {
    return this.getTags().includes("minecraft:is_sword");
  }

  /**
   * Get the tier of the item type.
   * @note This method evaluates the item type tags to determine the tier.
   * @returns The tier of the item type.
   */
  public getToolTier(): ItemTypeToolTier {
    // Iterate over the item tags.
    for (const tag of this.getTags()) {
      // Check if the tag is a rarity tier.
      switch (tag) {
        case "minecraft:wooden_tier":
          return ItemTypeToolTier.Wooden;

        case "minecraft:stone_tier":
          return ItemTypeToolTier.Stone;

        case "minecraft:copper_tier":
          return ItemTypeToolTier.Copper;

        case "minecraft:iron_tier":
          return ItemTypeToolTier.Iron;

        case "minecraft:golden_tier":
          return ItemTypeToolTier.Golden;

        case "minecraft:diamond_tier":
          return ItemTypeToolTier.Diamond;

        case "minecraft:netherite_tier":
          return ItemTypeToolTier.Netherite;
      }
    }

    return ItemTypeToolTier.None;
  }

  /**
   * Get the item type from the registry.
   */
  public static get(identifier: ItemIdentifier | string): ItemType | null {
    return ItemType.types.get(identifier) ?? null;
  }

  /**
   * Get the item type from the network.
   * @param network The network to get the item type from.
   */
  public static getByNetwork(network: number): ItemType | null {
    return (
      [...ItemType.types.values()].find((item) => item.network === network) ??
      null
    );
  }

  /**
   * Get all item types from the registry.
   */
  public static getAll(): Array<ItemType> {
    return [...ItemType.types.values()];
  }

  /**
   * Resolve the item type from the block type.
   * @param type The block type to resolve.
   */
  public static resolve(type: BlockType): ItemType | null {
    return (
      [...ItemType.types.values()].find((item) => {
        // Check if the item type is a block placer component.
        if (!item.components.hasBlockPlacer()) return false;

        // Get the block placer component from the item type.
        const blockPlacer = item.components.getBlockPlacer();

        // Check if the block placer component is not null.
        return blockPlacer.getBlockType() === type;
      }) ?? null
    );
  }

  /**
   * Convert the item type to a network instance.
   * @param type The item type to convert.
   * @param stackSize The stack size of the item type, default 1.
   * @param nbt The NBT of the item type, default null.
   * @returns The network item instance descriptor.
   */
  public static toNetworkInstance(
    type: ItemType,
    stackSize: number = 1,
    nbt: CompoundTag | null = null
  ): NetworkItemInstanceDescriptor {
    // Prepare the network block id.
    let networkBlockId = 0;

    // Check if the item type is a block placer component.
    if (type.components.hasBlockPlacer()) {
      // Get the block placer component from the item type.
      const blockPlacer = type.components.getBlockPlacer();

      // Set the network block id to the block placer component.
      networkBlockId = blockPlacer.getBlockType().getPermutation().networkId;
    }

    // Return the network item instance descriptor.
    return {
      network: type.network,
      metadata: 0,
      networkBlockId,
      stackSize,
      extras: {
        canDestroy: [],
        canPlaceOn: [],
        nbt
      }
    };
  }

  /**
   * Converts the item type to a network item stack descriptor.
   * @note Method is used on the protocol level.
   * @param type The item type to convert.
   * @returns The network item stack descriptor.
   */
  public static toNetworkStack(type: ItemType): NetworkItemStackDescriptor {
    // Get network item instance descriptor.
    const instance = ItemType.toNetworkInstance(type);

    // Return the item stack descriptor.
    return {
      ...instance,
      itemStackId: null // TODO: Implement stackNetId, this is so that the server can track the item stack.
    };
  }
}

export { ItemType };
