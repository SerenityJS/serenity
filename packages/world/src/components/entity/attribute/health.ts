import { Attribute } from "@serenityjs/protocol";

import { EntityAttributeComponent } from "./attribute";

import type { Entity } from "../../../entity";

class EntityHealthComponent extends EntityAttributeComponent {
	/**
	 * The identifier of the component.
	 */
	public static readonly identifier = Attribute.Health;

	/**
	 * The minimum health allowed for the entity.
	 */
	public readonly effectiveMin = 0;

	/**
	 * The maximum health allowed for the entity.
	 */
	public readonly effectiveMax = 20;

	/**
	 * The default health for the entity.
	 */
	public readonly defaultValue = 20;

	/**
	 * The current health of the entity.
	 */
	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity health component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity health component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityHealthComponent.identifier);
	}
}

export { EntityHealthComponent };
