import { ActorDataId, ActorDataType } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityScaleComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:scale";

	public static readonly types = [EntityIdentifier.Player];

	public readonly key = ActorDataId.Reserved038;

	public readonly type = ActorDataType.Float;

	public defaultValue = 1;

	/**
	 * Set a custom scale for your entity (Width and Height)
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity scale component
	 */
	public constructor(entity: Entity) {
		super(entity, EntityScaleComponent.identifier);

		// Set the entity to have a custom scale
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityScaleComponent };
