import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntityNametagComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:nametag";

	public readonly key = MetadataKey.Nametag;

	public readonly type = MetadataType.String;

	public defaultValue = this.entity.type.identifier as string;

	/**
	 * Creates a new entity nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityNametagComponent.identifier);

		// Check if the entity is a player
		if (entity.isPlayer()) this.defaultValue = entity.username;

		// Set the entity to have a nametag
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityNametagComponent };
