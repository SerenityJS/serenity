import { CompoundTag } from "@serenityjs/nbt";

import { BlockType } from "../../block";
import { ItemToolTier, ItemToolType } from "../../enums";
import { World } from "../../world";
import { ItemStackEntry } from "../world";

interface ItemTypeProperties {
  version: number;
  isComponentBased: boolean;
  stackable: boolean;
  maxAmount: number;
  tool: ItemToolType;
  tier: ItemToolTier;
  tags: Array<string>;
  block: BlockType | null;
  properties: CompoundTag<unknown>;
}
interface ItemStackProperties {
  amount: number;
  auxillary: number;
  world?: World;
  entry?: ItemStackEntry;
}

export { ItemStackProperties, ItemTypeProperties };
