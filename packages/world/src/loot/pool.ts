import type { ItemStack } from "../item";
import type { LootEntry } from "../types";

class LootPool {
	private readonly entries: Array<LootEntry> = [];
	public rolls: number = 1;

	public constructor(entries: Array<LootEntry>, rolls: number) {
		this.entries = entries;
		this.rolls = rolls;
	}

	/**
	 * Rolls the loot pool to generate an array of item stacks based on the entries and their weights.
	 * @returns An array of item stacks obtained from the loot pool.
	 */

	public roll(): Array<ItemStack> {
		const loot: Array<ItemStack> = [];
		const totalWeight = this.entries
			.map((entry) => entry.weight)
			.reduce((accumulator, current) => accumulator + current, 0);

		for (let index = 0; index < this.rolls; index++) {
			const randomWeight = Math.random() * totalWeight;
			let cumulativeWeight = 0;

			for (const entry of this.entries) {
				cumulativeWeight += entry.weight;
				if (randomWeight > cumulativeWeight) continue;
				loot.push(entry.itemStack);
				break;
			}
		}

		return loot;
	}

	/**
	 * Adds a new entry to the loot pool.
	 * @param entry - The loot entry to be added to the pool.
	 */
	public addEntry(entry: LootEntry): void {
		this.entries.push(entry);
	}

	/**
	 * Removes a specified entry from the loot pool.
	 * @param entry - The loot entry to be removed from the pool.
	 */
	public removeEntry(entry: LootEntry): void {
		this.entries.splice(this.entries.indexOf(entry), 1);
	}
}

export { LootPool };
