import { CompoundTag } from "@serenityjs/nbt";

import type { ItemType } from "./type";

class CreativeItem {
  /**
   * A collective map of creative items registered.
   */
  public static readonly items = new Map<number, CreativeItem>();

  /**
   * The type of the creative item.
   */
  public readonly type: ItemType;

  /**
   * The metadata of the creative item.
   */
  public readonly metadata: number;

  /**
   * The NBT of the creative item.
   */
  public readonly nbt: CompoundTag<unknown>;

  /**
   * Create a new creative item.
   * @param type The type of the creative item.
   * @param metadata The metadata of the creative item.
   */
  public constructor(
    type: ItemType,
    metadata: number,
    nbt?: CompoundTag<unknown>
  ) {
    this.type = type;
    this.metadata = metadata;
    this.nbt = nbt ?? new CompoundTag({ name: "", value: {} });
  }

  /**
   * Register a new creative item.
   * @param type The type of the creative item.
   * @param metadata The metadata of the creative item.
   */
  public static register(type: ItemType, metadata: number): void {
    // Get the index for the item.
    const index = CreativeItem.items.size;

    // Set the item in the registry.
    CreativeItem.items.set(index, new CreativeItem(type, metadata));
  }
}

export { CreativeItem };
