import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityBoundingHeightComponent extends EntityMetadataComponent {
	public readonly flag = false;

	public readonly key = MetadataKey.BoundingBoxHeight;

	public readonly type = MetadataType.Float;

	public defaultValue = 1.7; // 1.7 Is the most common.

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity boundingbox height component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity boundingbox height component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:boundingbox_height");
	}
}

export { EntityBoundingHeightComponent };
