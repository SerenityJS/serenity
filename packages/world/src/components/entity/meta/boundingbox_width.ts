import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityBoundingWidthComponent extends EntityMetadataComponent {
	public readonly flag = false;

	public readonly key = MetadataKey.BoundingBoxWidth;

	public readonly type = MetadataType.Float;

	public defaultValue = 0.6;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity boundingbox width component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity boundingbox width component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:boundingbox_width");
	}
}

export { EntityBoundingWidthComponent };
