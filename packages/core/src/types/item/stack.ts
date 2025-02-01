import { CompoundTag } from "@serenityjs/nbt";
import { CreativeItemCategory, CreativeItemGroup } from "@serenityjs/protocol";

import { ItemToolTier, ItemToolType } from "../../enums";
import { World } from "../../world";
import { ItemStackEntry } from "../world";
import { BlockType } from "../../block";

interface ItemTypeProperties {
  properties: CompoundTag<unknown>;
  isComponentBased: boolean;
  version: number;
  maxAmount: number;
  tool: ItemToolType;
  tier: ItemToolTier;
  tags: Array<string>;
  blockType: BlockType | null;
  creativeCategory: CreativeItemCategory;
  creativeGroup: CreativeItemGroup | string;
}

interface ItemStackProperties {
  amount: number;
  metadata: number;
  world?: World;
  entry?: ItemStackEntry;
}

export { ItemStackProperties, ItemTypeProperties };
