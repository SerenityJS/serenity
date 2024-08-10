import { ContainerId, ContainerType } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityContainer } from "../../container";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";
import type { ItemStack } from "../../item";

class EntityInventoryComponent extends EntityComponent {
	public static readonly identifier = "minecraft:inventory";

	public static readonly types = [EntityIdentifier.Player];

	public readonly container: EntityContainer;

	public readonly containerType: ContainerType = ContainerType.Inventory;

	public readonly containerId: ContainerId = ContainerId.Inventory;

	public readonly inventorySize: number = 36;

	public selectedSlot: number = 0;

	public constructor(entity: Entity) {
		super(entity, EntityInventoryComponent.identifier);
		this.container = new EntityContainer(
			entity,
			this.containerType,
			this.containerId,
			this.inventorySize
		);
	}

	public getHeldItem(): ItemStack | null {
		return this.container.getItem(this.selectedSlot);
	}
}

export { EntityInventoryComponent };
