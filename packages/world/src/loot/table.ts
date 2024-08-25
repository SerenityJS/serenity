import type { ItemStack } from "../item";
import type { LootPool } from "./pool";

class LootTable {
	private readonly pools: Set<LootPool>;

	public constructor(pools: Array<LootPool>) {
		this.pools = new Set(pools);
	}

	// Add a new pool to the loot table.
	public addPool(pool: LootPool): void {
		this.pools.add(pool);
	}

	// Remove a pool from the loot table
	public removePool(pool: LootPool): void {
		this.pools.delete(pool);
	}

	// Get all pools in the loot table
	public getPools(): Set<LootPool> {
		return this.pools;
	}

	// Generate loot from the loot table
	public generateLoot(): Array<ItemStack> {
		const loot: Array<ItemStack> = [];

		for (const pool of this.pools) {
			loot.push(...pool.roll());
		}
		return loot;
	}
}

export { LootTable };
