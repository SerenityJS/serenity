import { ActorDataId, ActorDataType } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityVariantComponent extends EntityDataComponent<number> {
	public static readonly identifier = "minecraft:variant";

	public readonly key = ActorDataId.Variant;

	public readonly type = ActorDataType.Int;

	public defaultValue = 0;

	/**
	 * Set a variant for the entity.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity scale component
	 */
	public constructor(entity: Entity) {
		super(entity, EntityVariantComponent.identifier);

		// Check if the entity is a player
		if (entity.isPlayer()) this.defaultValue = 1;

		// Set the entity to have a variant
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityVariantComponent };
