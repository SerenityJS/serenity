import { ActorFlag } from "@serenityjs/protocol";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityOnFireComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:on_fire";

	public readonly flag = ActorFlag.OnFire;

	public defaultValue = false;

	/**
	 * Creates a new entity breathing component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity breathing component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityOnFireComponent.identifier);

		// Set the entity to have breathing
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityOnFireComponent };
