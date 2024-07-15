import { ActorDataId, ActorDataType } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityBoundingWidthComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:boundingbox_width";

	public readonly key = ActorDataId.Reserved054;

	public readonly type = ActorDataType.Float;

	public defaultValue = 0.6;
	/**
	 * Creates a new entity boundingbox width component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity boundingbox width component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityBoundingWidthComponent.identifier);

		// Set the entity to have a custom boundingbox width
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityBoundingWidthComponent };
