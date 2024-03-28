import { MetadataFlags, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityBreathingComponent extends EntityMetadataComponent {
	public readonly flag = true;

	public readonly key = MetadataFlags.Breathing;

	public readonly type = MetadataType.Long;

	public defaultValue = true;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity breathing component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity breathing component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:breathing");
	}
}

export { EntityBreathingComponent };
