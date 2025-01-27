import { CompoundTag } from "@serenityjs/nbt";

import { Items, ItemTypeProperties } from "../../types";
import { ItemToolTier, ItemToolType } from "../../enums";
import { BlockType } from "../../block";

import { ItemTypeVanillaProperties } from "./properties";

import type { NetworkItemInstanceDescriptor } from "@serenityjs/protocol";

const DefaultItemTypeProperties: ItemTypeProperties = {
  version: 1,
  isComponentBased: true,
  stackable: true,
  maxAmount: 64,
  tool: ItemToolType.None,
  tier: ItemToolTier.None,
  tags: [],
  block: null,
  properties: new ItemTypeVanillaProperties()
};

class ItemType<T extends keyof Items = keyof Items> {
  /**
   * A collective registry of all item types.
   */
  public static readonly types = new Map<string, ItemType>();

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
   * Whether the item type is component-based.
   */
  public readonly isComponentBased: boolean = false;

  /**
   * Whether the item type is stackable.
   */
  public readonly stackable: boolean = true;

  /**
   * The maximum stack size of the item type.
   */
  public readonly maxAmount: number = 64;

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

  public readonly nbt = new CompoundTag<unknown>();

  public readonly properties: ItemTypeVanillaProperties;

  /**
   * The block of the item type, if applicable.
   */
  public readonly block: Items[T];

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

    // Assign the default properties of the item type.
    properties = { ...DefaultItemTypeProperties, ...properties };

    // Assign the properties of the item type.
    this.version = properties.version ?? 1;
    this.isComponentBased = properties.isComponentBased ?? true;
    this.stackable = properties.stackable ?? true;
    this.maxAmount = properties.maxAmount ?? 64;
    this.tool = properties.tool as ItemToolType;
    this.tier = properties.tier as ItemToolTier;
    this.tags = properties.tags ?? [];
    this.block = properties.block as Items[T];
    this.properties = properties.properties as ItemTypeVanillaProperties;
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
      [...ItemType.types.values()].find((item) => item.block === type) ?? null
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
      networkBlockId: type.block?.getPermutation().network ?? 0,
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
