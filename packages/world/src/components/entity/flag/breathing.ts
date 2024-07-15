import { ActorFlag } from "@serenityjs/protocol";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityBreathingComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:breathing";

	public readonly flag = ActorFlag.Breathing;

	public defaultValue = true;

	/**
	 * Creates a new entity breathing component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity breathing component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityBreathingComponent.identifier);

		// Set the entity to have breathing
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityBreathingComponent };
