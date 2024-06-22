import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntityBoundingHeightComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:boundingbox_height";

	public readonly key = MetadataKey.BoundingBoxHeight;

	public readonly type = MetadataType.Float;

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
