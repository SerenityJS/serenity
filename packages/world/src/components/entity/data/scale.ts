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

	public setCurrentValue(value: number, sync?: boolean): void {
		// Get the entity collision height and width
		const entityHeight = this.entity.getComponent(
			"minecraft:boundingbox_height"
		);
		const entityWidth = this.entity.getComponent("minecraft:boundingbox_width");

		// Recalculate the collision size
		if (entityHeight)
			entityHeight.setCurrentValue(
				(entityHeight.getCurrentValue() as number) * value
			);

		if (entityWidth)
			entityWidth.setCurrentValue(
				(entityWidth.getCurrentValue() as number) * value
			);

		// Continue with the base method
		super.setCurrentValue(value, sync);
	}
}

export { EntityScaleComponent };
