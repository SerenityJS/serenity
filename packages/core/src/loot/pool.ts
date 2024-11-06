import { ItemStack } from "../item";
import { LootEntry } from "../types";

class LootPool {
  private entries: Array<LootEntry> = [];
  public rolls: number = 1;

  public constructor(entries: Array<LootEntry>, rolls: number) {
    this.entries = entries;
    this.rolls = rolls;
  }

  /**
   * Rolls the pool to get the loot items.
   * @returns The loot items from the pool roll.
   */
  public roll(): Array<ItemStack> {
    const results: Array<ItemStack> = [];
    const totalWeight = this.entries
      .map(({ weight }) => weight)
      .reduce((a, c) => c + a);

    for (let _ = 0; _ < this.rolls; _++) {
      const randomWeight = Math.random() * totalWeight;
      let accumulative = 0;

      for (const { weight, itemStack, function: callback } of this.entries) {
        accumulative += weight;
        if (randomWeight < accumulative) {
          results.push(callback?.(itemStack) ?? itemStack);
          break;
        }
      }
    }
    return results;
  }

  /**
   * Adds a new loot entry to the loot pool.
   * @param entry The entry that will be added.
   */
  public addEntry(entry: LootEntry): this {
    this.entries.push(entry);
    return this;
  }

  /**
   * Removes an entry from the loot pool.
   * @param entry The entry that will be removed.
   */
  public removeEntry(entry: LootEntry): this {
    this.entries.splice(this.entries.indexOf(entry), 1);
    return this;
  }
}

export { LootPool };
