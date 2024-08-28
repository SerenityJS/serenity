import { BlockComponent } from "./block-component";

import type { Block } from "../../block";
import type { LootTable } from "../../loot";

class BlockLootComponent extends BlockComponent {
	public static readonly identifier = "minecraft:loot_table";
	public lootTable?: LootTable;

	public constructor(block: Block) {
		super(block, BlockLootComponent.identifier);
	}

	public onPlace(): void {
		this.generateLoot();
	}

	public generateLoot(): void {
		if (!this.lootTable) return;
		if (!this.block.hasComponent("minecraft:inventory"))
			throw new Error("The block must have an inventory");
		const inventory = this.block.getComponent("minecraft:inventory");

		for (const item of this.lootTable.generateLoot()) {
			let slot: number = Math.floor(Math.random() * inventory.inventorySize);

			while (inventory.container.getItem(slot)) {
				slot = Math.floor(Math.random() * inventory.inventorySize);
			}
			inventory.container.setItem(slot, item);
		}
	}
}

export { BlockLootComponent };
