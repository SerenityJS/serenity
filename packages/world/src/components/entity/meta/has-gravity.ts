import { MetadataFlags, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityHasGravityComponent extends EntityMetadataComponent {
	public readonly flag = true;

	public readonly key = MetadataFlags.AffectedByGravity;

	public readonly type = MetadataType.Long;

	public defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity has gravity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity has gravity component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:has_gravity");
	}
}

export { EntityHasGravityComponent };
