import { ContainerId } from "@serenityjs/protocol";

import { EntityContainer } from "../../container";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";
import type { ItemStack } from "../../item";

class EntityInventoryComponent extends EntityComponent {
	public readonly identifier = "minecraft:inventory";

	public readonly container: EntityContainer;

	public readonly containerId: ContainerId;

	public readonly inventorySize: number;

	public selectedSlot: number = 0;

	public constructor(entity: Entity) {
		super(entity, "minecraft:inventory");
		this.containerId = ContainerId.Inventory;
		this.inventorySize = 36;
		this.container = new EntityContainer(
			entity,
			this.containerId,
			this.inventorySize
		);
	}

	public getHeldItem(): ItemStack | null {
		return this.container.getItem(this.selectedSlot);
	}
}

export { EntityInventoryComponent };
