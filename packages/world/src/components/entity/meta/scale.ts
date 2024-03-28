import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityScaleComponent extends EntityMetadataComponent {
	public readonly flag = false;

	public readonly key = MetadataKey.Scale;

	public readonly type = MetadataType.Float;

	public defaultValue = 1;

	public currentValue = this.defaultValue;

	/**
	 * Set a custom scale for your entity (Width and Height)
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity scale component
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:scale");
	}
}

export { EntityScaleComponent };
