import { CompoundTag } from "@serenityjs/nbt";

import { ItemToolTier, ItemToolType } from "../../enums";
import { World } from "../../world";
import { ItemStackEntry } from "../world";
import { BlockType } from "../..";

interface ItemTypeProperties {
  properties: CompoundTag<unknown>;
  isComponentBased: boolean;
  version: number;
  stackable: boolean;
  maxAmount: number;
  tool: ItemToolType;
  tier: ItemToolTier;
  tags: Array<string>;
  blockType: BlockType | null;
}

interface ItemStackProperties {
  amount: number;
  metadata: number;
  world?: World;
  entry?: ItemStackEntry;
}

export { ItemStackProperties, ItemTypeProperties };
