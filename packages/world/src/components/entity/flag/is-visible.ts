import { ActorFlag } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityIsVisibleComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:is_visible";

	public static readonly types = [EntityIdentifier.Player];

	public readonly flag = ActorFlag.Invisible;

	public defaultValue = false;

	/**
	 * Creates a new entity visible component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity visible component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityIsVisibleComponent.identifier);

		// Set the entity to be visible
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityIsVisibleComponent };
