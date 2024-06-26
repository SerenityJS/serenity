import {
	ContainerId,
	ContainerType,
	type EquipmentSlot
} from "@serenityjs/protocol";
import { ItemIdentifier } from "@serenityjs/item";

import { EntityContainer } from "../../container";
import { ItemStack } from "../../item";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

class EntityArmorComponent extends EntityComponent {
	public static readonly identifier = "minecraft:armor";
	public readonly container: EntityContainer;

	public constructor(entity: Entity) {
		super(entity, EntityArmorComponent.identifier);
		this.container = new EntityContainer(
			entity,
			ContainerType.Armor,
			ContainerId.Armor,
			4
		);
	}

	public getAll(): Array<ItemStack> {
		return this.container.storage.map(
			(item) => item ?? new ItemStack(ItemIdentifier.Air, 1)
		);
	}

	public setEquipment(slot: EquipmentSlot, itemStack: ItemStack): void {
		return this.container.setItem(slot, itemStack);
	}

	public getEquipment(slot: EquipmentSlot): ItemStack | null {
		return this.container.getItem(slot);
	}
}

export { EntityArmorComponent };
