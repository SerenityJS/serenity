import { CompoundTag } from "@serenityjs/nbt";
import {
  CreativeItemCategory,
  CreativeItemGroup,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";
import { BinaryStream } from "@serenityjs/binarystream";
import { ITEM_METADATA, ITEM_TYPES, TOOL_TYPES } from "@serenityjs/data";

import { ItemIdentifier, ItemToolTier, ItemToolType } from "../../enums";
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

      // Get the tool type for the item type.
      const tool = TOOL_TYPES.find((tool) =>
        tool.types.includes(type.identifier)
      );
      const index = tool?.types.indexOf(type.identifier);
      const level = index === undefined ? ItemToolTier.None : index + 1;

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
    this.tool = properties?.tool as ItemToolType;
    this.tier = properties?.tier as ItemToolTier;
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
   * Determine if the item type is a tool.
   * @returns Whether the item type is a tool.
   */
  public isTool(): boolean {
    return this.tool !== ItemToolType.None && this.tier !== ItemToolTier.None;
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
