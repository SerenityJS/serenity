import type {
  CreativeItemCategory,
  CreativeItemGroup
} from "@serenityjs/protocol";
import type { CompoundTag } from "@serenityjs/nbt";
import type { BlockType } from "../../block";
import type { ItemToolTier, ItemToolType } from "../../enums";

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

  tool: ItemToolType;
  tier: ItemToolTier;
  tags: Array<string>;
  blockType: BlockType | null;
  creativeCategory: CreativeItemCategory;
  creativeGroup: CreativeItemGroup | string;
}

export { ItemTypeOptions };
