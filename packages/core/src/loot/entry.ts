import { ItemStack } from "../item";

interface LootEntry {
  /**
   * The item stack of the loot entry.
   */
  itemStack: ItemStack;

  /**
   * The weight of the loot entry.
   */
  weight: number;
}

export type { LootEntry };
