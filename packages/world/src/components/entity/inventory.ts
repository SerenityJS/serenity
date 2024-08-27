import { ContainerId, ContainerType } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";
import { type ListTag, Tag, type CompoundTag } from "@serenityjs/nbt";

import { EntityContainer } from "../../container";
import { ItemStack } from "../../item";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";

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

	public static serialize(
		nbt: CompoundTag,
		component: EntityInventoryComponent
	): void {
		// Create the inventory list tag.
		const inventory = nbt.createListTag("Inventory", Tag.Compound);

		// Iterate of the items in the container.
		for (let index = 0; index < component.container.size; index++) {
			// Get the item stack.
			const itemStack = component.container.getItem(index);

			// Check if the item stack exists.
			if (!itemStack) continue;

			// Serialize the item stack.
			const nbt = ItemStack.serialize(itemStack);
			nbt.createByteTag("Slot", index);

			// Add the item stack to the inventory.
			inventory.push(nbt);
		}
	}

	public static deserialize(
		nbt: CompoundTag,
		entity: Entity
	): EntityInventoryComponent {
		// Create a new entity inventory component.
		const component = new EntityInventoryComponent(entity);

		// Check if the inventory tag exists.
		if (!nbt.hasTag("Inventory")) return component;

		// Get the inventory tag.
		const inventory = nbt.getTag("Inventory") as ListTag<CompoundTag>;

		// Iterate over the inventory items.
		for (const itemTag of inventory.value) {
			// Get the slot of the item.
			const slot = itemTag.getTag("Slot")?.value as number;

			// Deserialize the item stack.
			const itemStack = ItemStack.deserialize(itemTag);

			// Add the item stack to the container.
			component.container.setItem(slot, itemStack);
		}

		// Return the entity inventory component.
		return component;
	}
}

export { EntityInventoryComponent };
