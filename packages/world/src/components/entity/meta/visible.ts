import { MetadataFlags, MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntityIsVisibleComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:is_visible";
	public readonly key = MetadataKey.Flags;
	public readonly type = MetadataType.Byte;
	public flag?: MetadataFlags = MetadataFlags.Invisible;
	public defaultValue = false;

	/**
	 * Creates a new entity visible component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity visible component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityIsVisibleComponent.identifier);

		// Set the entity to be visible
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityIsVisibleComponent };
