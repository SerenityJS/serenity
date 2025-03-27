import { CompoundTag } from "@serenityjs/nbt";
import {
  CreativeItemCategory,
  CreativeItemGroup,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { ITEM_METADATA, ITEM_TYPES, TOOL_TYPES } from "@serenityjs/data";

import { Items, ItemTypeProperties } from "../../types";
import { ItemIdentifier, ItemToolTier, ItemToolType } from "../../enums";
import { BlockType } from "../../block";

import { ItemTypeComponentCollection } from "./collection";

class ItemType<T extends keyof Items = keyof Items> {
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

      // Get the tool type for the item type.
      const tool = TOOL_TYPES.find((tool) =>
        tool.types.includes(type.identifier)
      );
      const index = tool?.types.indexOf(type.identifier);
      const level = index === undefined ? ItemToolTier.None : index + 1;

      // Get the block type for the item type.
      const blockType = BlockType.types.get(type.identifier) ?? null;

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
          tool: tool?.network,
          tier: level,
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
  public readonly identifier: T;

  /**
   * The network of the item type.
   */
  public readonly network: number;

  /**
   * The version of the item type.
   */
  public readonly version: number = 1;

  /**
   * The block type of the item type.
   */
  public readonly blockType: BlockType | null = null;

  /**
   * The tool type of the item type.
   */
  public readonly tool: ItemToolType;

  /**
   * The tool tier of the item type.
   */
  public readonly tier: ItemToolTier;

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
   * Whether the item type is component based.
   */
  public readonly isComponentBased: boolean;

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
    identifier: T,
    network: number,
    properties?: Partial<ItemTypeProperties>
  ) {
    // Assign the identifier and network of the item type.
    this.identifier = identifier;
    this.network = network;

    // Assign the properties of the item type first.
    // As this will be used to define the item type.
    this.properties = properties?.properties ?? new CompoundTag();

    // Assign the properties of the item type.
    this.version = properties?.version ?? 1;
    this.tool = properties?.tool as ItemToolType;
    this.tier = properties?.tier as ItemToolTier;
    this.tags = properties?.tags ?? [];
    this.isComponentBased = properties?.isComponentBased ?? true;
    this.blockType = properties?.blockType ?? null;

    // Assign the creative properties of the item type.
    this.creativeCategory =
      properties?.creativeCategory ?? CreativeItemCategory.Undefined;
    this.creativeGroup =
      properties?.creativeGroup ?? `itemGroup.name.${identifier}`;

    // Assign the component based properties of the item type.
    this.components.setMaxStackSize(properties?.maxAmount ?? 64);
    this.components.setBlockPlacer({ useBlockAsIcon: true, useOn: [] });
  }

  /**
   * Determine if the item type is a tool.
   * @returns Whether the item type is a tool.
   */
  public isTool(): boolean {
    return this.tool !== ItemToolType.None && this.tier !== ItemToolTier.None;
  }

  /**
   * Get the item type from the registry.
   */
  public static get<T extends keyof Items>(identifier: T): ItemType<T> | null {
    return ItemType.types.get(identifier) as ItemType<T>;
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
      [...ItemType.types.values()].find((item) => item.blockType === type) ??
      null
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
    return {
      network: type.network,
      metadata: 0,
      networkBlockId: type.blockType?.getPermutation().networkId ?? 0,
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
