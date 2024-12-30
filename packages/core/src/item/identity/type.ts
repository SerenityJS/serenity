import { CompoundTag } from "@serenityjs/nbt";

import { Items, ItemTypeProperties } from "../../types";
import { ItemToolTier, ItemToolType } from "../../enums";
import { BlockType } from "../../block";

import { ItemTypeVanillaProperties } from "./properties";

import type {
  ItemData,
  NetworkItemInstanceDescriptor
} from "@serenityjs/protocol";

const DefaultItemTypeProperties: ItemTypeProperties = {
  stackable: true,
  maxAmount: 64,
  tool: ItemToolType.None,
  tier: ItemToolTier.None,
  tags: [],
  block: null
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
   * Whether the item type is stackable.
   */
  public readonly stackable: boolean;

  /**
   * The maximum stack size of the item type.
   */
  public readonly maxAmount: number;

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

  public readonly properties = new ItemTypeVanillaProperties();

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
    this.identifier = identifier;
    this.network = network;

    const props = { ...DefaultItemTypeProperties, ...properties };

    this.stackable = props.stackable;
    this.maxAmount = props.maxAmount;
    this.tool = props.tool;
    this.tier = props.tier;
    this.tags = props.tags;
    this.block = props.block as Items[T];
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
   * Convert the item type to item data, this is used for the protocol.
   * @param type The item type to convert.
   */
  public static toItemData(type: ItemType): ItemData {
    return {
      name: type.identifier,
      networkId: type.network,
      componentBased: false
    };
  }

  public static toNetworkInstance(
    type: ItemType,
    stackSize: number = 1
  ): NetworkItemInstanceDescriptor {
    return {
      network: type.network,
      metadata: 0,
      networkBlockId: type.block?.getPermutation().network ?? 0,
      stackSize,
      extras: {
        canDestroy: [],
        canPlaceOn: [],
        nbt: null
      }
    };
  }
}

export { ItemType };
