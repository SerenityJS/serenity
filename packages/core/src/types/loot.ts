import { ItemStack } from "../item";

interface LootEntry {
  itemStack: ItemStack;
  weight: number;
  function?: (itemStack: ItemStack) => ItemStack;
}

export { LootEntry };
