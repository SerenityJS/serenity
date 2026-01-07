import { ItemStack } from "../item";

import { LootPool } from "./pool";

class LootTable {
  /**
   * The loot pools contained in the loot table.
   */
  private readonly pools: Set<LootPool>;

  /**
   * Creates a new loot table.
   * @param pools The loot pools that will be contained in the loot table.
   */
  public constructor(pools: Array<LootPool> | Set<LootPool>) {
    this.pools = new Set(pools);
  }

  /**
   * Adds a pool to the loot table.
   * @param pool The loot pool that will be added to the table.
   */
  public addPool(pool: LootPool): this {
    this.pools.add(pool);
    return this;
  }

  /**
   * Removes a pool from the loot table
   * @param pool The pool that will be removed from the table.
   */
  public removePool(pool: LootPool): this {
    this.pools.delete(pool);
    return this;
  }

  /**
   * Generates the random loot from the loot pools.
   * @returns The loot resultant of the roll of every pool.
   */
  public getLoot(): Array<ItemStack> {
    // Prepare an array to store the loot
    const loot: Array<ItemStack> = [];

    // Roll every pool and add the results to the loot array
    for (const pool of this.pools) loot.push(...pool.roll());

    // Return the generated loot
    return loot;
  }
}

export { LootTable };
