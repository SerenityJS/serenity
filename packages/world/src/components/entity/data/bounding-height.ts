import { ActorDataId, ActorDataType } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityBoundingHeightComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:boundingbox_height";

	public readonly key = ActorDataId.Reserved053;

	public readonly type = ActorDataType.Float;

	public defaultValue = 1.7; // 1.7 Is the most common.

	/**
	 * Creates a new entity boundingbox height component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity boundingbox height component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityBoundingHeightComponent.identifier);

		// Set the entity to have a custom boundingbox height
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityBoundingHeightComponent };
