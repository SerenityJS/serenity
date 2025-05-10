import { CompoundTag } from "@serenityjs/nbt";
import {
  CreativeItemCategory,
  CreativeItemGroup,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { ITEM_METADATA, ITEM_TYPES } from "@serenityjs/data";

import { ItemIdentifier, ItemToolType, ItemTypeToolTier } from "../../enums";
import { BlockType } from "../../block";

import { ItemTypeComponentCollection } from "./collection";

import type { ItemTrait } from "../traits";
import type { ItemTypeOptions } from "../types";

class ItemType {
  /**
   * A collective registry of all item types.
   */
  public static readonly types = new Map<string, ItemType>();

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
          maxAmount: type.maxAmount,
          tags: type.tags ?? []
        }
      );

      // Add the item type to the map.
      this.types.set(instance.identifier, instance);
    }
  }

  /**
   * The identifier of the item type.
   */
  public readonly identifier: ItemIdentifier;

  /**
   * The network of the item type.
   */
  public readonly network: number;

  /**
   * The version of the item type.
   */
  public readonly version: number = 1;
  /**
   * The tags of the item type.
   */
  public readonly tags: Array<string>;

  /**
   * The nbt properties definition of the item type.
   * This contains the vanilla component definitions.
   */
  public readonly properties: CompoundTag<unknown>;

  /**
   * The traits that are bound to the item type.
   * These traits are used to define custom behavior for the item type.
   */
  public readonly traits = new Map<string, typeof ItemTrait>();

  /**
   * Whether the item type is component based.
   */
  public isComponentBased: boolean;

  public creativeCategory: CreativeItemCategory;

  public creativeGroup: CreativeItemGroup | string;

  /**
   * The maximum stack size of the item type.
   */
  public get maxAmount(): number {
    return this.components.getMaxStackSize();
  }

  /**
   * Whether the item type is stackable.
   */
  public get isStackable(): boolean {
    return this.maxAmount > 1;
  }

  /**
   * The vanilla components of the item type.
   */
  public get components(): ItemTypeComponentCollection {
    // Check if the item type contains the components tag.
    if (this.properties.hasTag("components")) {
      // Get the components tag from the item type.
      const components =
        this.properties.getTag<CompoundTag<unknown>>("components");

      // Check if the components is instance of the component collection.
      if (components instanceof ItemTypeComponentCollection) return components;

      // Create the new component collection.
      const collection = new ItemTypeComponentCollection(this);

      // Assign the components to the collection.
      collection.value = components.value;

      // Set the components tag to the item type.
      this.properties.setTag("components", collection);

      // Return the component collection.
      return collection;
    }

    // Create the new component collection.
    const components = new ItemTypeComponentCollection(this);

    // Add the components tag to the item type.
    this.properties.addTag(components);

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
    identifier: ItemIdentifier,
    network: number,
    properties?: Partial<ItemTypeOptions>
  ) {
    // Assign the identifier and network of the item type.
    this.identifier = identifier;
    this.network = network;

    // Assign the properties of the item type first.
    // As this will be used to define the item type.
    this.properties = properties?.properties ?? new CompoundTag();

    // Create a id tag.
    this.properties.createIntTag({ name: "id", value: this.network });

    // Create a name tag.
    this.properties.createStringTag({ name: "name", value: this.identifier });

    // Assign the properties of the item type.
    this.version = properties?.version ?? 1;
    this.tags = properties?.tags ?? [];
    this.isComponentBased = properties?.isComponentBased ?? true;

    // Assign the creative properties of the item type.
    this.creativeCategory =
      properties?.creativeCategory ?? CreativeItemCategory.Undefined;
    this.creativeGroup =
      properties?.creativeGroup ?? `itemGroup.name.${identifier}`;

    // Assign the component based properties of the item type.
    this.components.setMaxStackSize(properties?.maxAmount ?? 64);
    this.components.setBlockPlacer({ blockType: properties?.blockType });
  }

  /**
   * Register a trait to the item type.
   * @param trait The trait to register.
   * @returns The item type instance.
   */
  public registerTrait(trait: typeof ItemTrait): this {
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
  public unregisterTrait(trait: string | typeof ItemTrait): this {
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
   * Whether the item type is a pickaxe.
   * @note This method evaluates if the item type contains the `minecraft:is_pickaxe` tag.
   * @returns True if the item type is a pickaxe, false otherwise.
   */
  public isPickaxe(): boolean {
    return this.tags.includes("minecraft:is_pickaxe");
  }

  /**
   * Whether the item type is a axe.
   * @note This method evaluates if the item type contains the `minecraft:is_axe` tag.
   * @returns True if the item type is a axe, false otherwise.
   */
  public isAxe(): boolean {
    return this.tags.includes("minecraft:is_axe");
  }

  /**
   * Whether the item type is a shovel.
   * @note This method evaluates if the item type contains the `minecraft:is_shovel` tag.
   * @returns True if the item type is a shovel, false otherwise.
   */
  public isShovel(): boolean {
    return this.tags.includes("minecraft:is_shovel");
  }

  /**
   * Whether the item type is a hoe.
   * @note This method evaluates if the item type contains the `minecraft:is_hoe` tag.
   * @returns True if the item type is a hoe, false otherwise.
   */
  public isHoe(): boolean {
    return this.tags.includes("minecraft:is_hoe");
  }

  /**
   * Whether the item type is a sword.
   * @note This method evaluates if the item type contains the `minecraft:is_sword` tag.
   * @returns True if the item type is a sword, false otherwise.
   */
  public isSword(): boolean {
    return this.tags.includes("minecraft:is_sword");
  }

  /**
   * Get the tier of the item type.
   * @note This method evaluates the item type tags to determine the tier.
   * @returns The tier of the item type.
   */
  public getToolTier(): ItemTypeToolTier {
    // Iterate over the item tags.
    for (const tag of this.tags) {
      // Check if the tag is a rarity tier.
      switch (tag) {
        case "minecraft:wooden_tier":
          return ItemTypeToolTier.Wooden;

        case "minecraft:stone_tier":
          return ItemTypeToolTier.Stone;

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
  public static get(identifier: ItemIdentifier): ItemType | null {
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
   * @returns
   */
  public static toNetworkInstance(
    type: ItemType,
    stackSize: number = 1,
    nbt: CompoundTag<unknown> | null = null
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
}

export { ItemType };
