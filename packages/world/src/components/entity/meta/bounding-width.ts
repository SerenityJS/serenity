import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntityBoundingWidthComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:boundingbox_width";

	public readonly key = MetadataKey.BoundingBoxWidth;

	public readonly type = MetadataType.Float;

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
