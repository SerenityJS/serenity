import { EntityComponent } from "./entity-component";

import type { LootTable } from "../../loot";
import type { Entity } from "../../entity";

// TODO: Implement tiered pools
class EntityLootComponent extends EntityComponent {
	public static readonly identifier = "minecraft:loot";
	public lootTable?: LootTable;

	public constructor(entity: Entity) {
		super(entity, EntityLootComponent.identifier);
	}

	/**
	 * Drops loot items based on the entity's loot table.
	 */
	public dropLoot(): void {
		if (!this.lootTable) return;
		for (const item of this.lootTable.generateLoot()) {
			this.entity.dimension.spawnItem(item, this.entity.position);
		}
	}
}

export { EntityLootComponent };
