import { BlockType } from "../../block";
import { ItemToolTier, ItemToolType } from "../../enums";
import { World } from "../../world";
import { ItemStackEntry } from "../world";

interface ItemTypeProperties {
  stackable: boolean;
  maxAmount: number;
  tool: ItemToolType;
  tier: ItemToolTier;
  tags: Array<string>;
  block: BlockType | null;
}
interface ItemStackProperties {
  amount: number;
  auxillary: number;
  world?: World;
  entry?: ItemStackEntry;
}

export { ItemStackProperties, ItemTypeProperties };
