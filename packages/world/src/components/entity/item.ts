import { EntityIdentifier } from "@serenityjs/entity";

import { EntityComponent } from "./entity-component";

import type { Entity } from "../../entity";
import type { ItemStack } from "../../item";

class EntityItemComponent extends EntityComponent {
	public static readonly identifier = "minecraft:item";

	/**
	 * The item stack of the component.
	 */
	public readonly itemStack: ItemStack;

	/**
	 * Creates a new entity inventory component.
	 *
	 * @param entity The entity of the component.
	 * @param itemStack The item stack of the component.
	 * @returns A new entity inventory component.
	 */
	public constructor(entity: Entity, itemStack: ItemStack) {
		super(entity, EntityItemComponent.identifier);

		// Check if the entity type is an item
		// If not we throw an error
		if (entity.type.identifier !== EntityIdentifier.Item) {
			throw new Error("Entity must be an item");
		}

		// Set the item stack of the component
		this.itemStack = itemStack;
	}
}

export { EntityItemComponent };
