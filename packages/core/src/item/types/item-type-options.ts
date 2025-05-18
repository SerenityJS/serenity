import type {
  CreativeItemCategory,
  CreativeItemGroup
} from "@serenityjs/protocol";
import type { CompoundTag } from "@serenityjs/nbt";
import type { BlockType } from "../../block";

interface ItemTypeOptions {
  /**
   * The nbt definition for the item type properties.
   */
  properties: CompoundTag<unknown>;

  /**
   * Whether the item type is component based.
   */
  isComponentBased: boolean;

  /**
   * The version of the item type.
   */
  version: number;

  /**
   * The maximum amount of items that can be stacked.
   */
  maxAmount: number;

  tags: Array<string>;
  blockType: BlockType;
  creativeCategory: CreativeItemCategory;
  creativeGroup: CreativeItemGroup | string;
}

export { ItemTypeOptions };
