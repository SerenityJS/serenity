import { ItemStack } from "../item";

import { LootEntry } from "./entry";

class LootPool {
  /**
   * The loot entries contained in the pool.
   */
  private readonly entries: Array<LootEntry> = [];

  /**
   * The number of rolls to perform when rolling the pool.
   */
  private rolls: number = 1;

  /**
   * Creates a new loot pool.
   * @param entries The loot entries that will be contained in the pool.
   * @param rolls The number of rolls to perform when rolling the pool.
   */
  public constructor(entries: Array<LootEntry>, rolls: number) {
    this.entries = entries;
    this.rolls = rolls;
  }

  /**
   * Gets the number of rolls of the loot pool.
   * @returns The number of rolls of the loot pool.
   */
  public getRolls(): number {
    return this.rolls;
  }

  /**
   * Sets the number of rolls of the loot pool.
   * @param rolls The number of rolls to set.
   * @returns The loot pool instance.
   */
  public setRolls(rolls: number): this {
    this.rolls = rolls;

    return this;
  }

  /**
   * Rolls the pool to get the loot items.
   * @returns The loot items from the pool roll.
   */
  public roll(): Array<ItemStack> {
    // Prepare an array to store the results
    const results: Array<ItemStack> = [];

    // Calculate the total weight of all entries
    const totalWeight = this.entries
      .map(({ weight }) => weight)
      .reduce((a, c) => c + a);

    // Perform the rolls
    for (let i = 0; i < this.rolls; i++) {
      // Calculate a random weight
      const randomWeight = Math.random() * totalWeight;
      let accumulative = 0;

      // Find the entry that matches the random weight
      for (const { weight, itemStack } of this.entries) {
        // Add the weight to the accumulative
        accumulative += weight;

        // Check if the random weight is less than the accumulative
        if (randomWeight < accumulative) {
          results.push(itemStack);
          break;
        }
      }
    }

    // Return the rolled results
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
