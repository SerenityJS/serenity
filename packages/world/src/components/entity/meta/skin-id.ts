import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntitySkinIDComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:scale";

	public readonly key = MetadataKey.SkinID;

	public readonly type = MetadataType.String;

	public defaultValue = String();

	/**
	 * Set a custom scale for your entity (Width and Height)
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity scale component
	 */
	public constructor(entity: Entity) {
		super(entity, EntitySkinIDComponent.identifier);

		// Check if the entity is a player
		if (entity.isPlayer()) this.defaultValue = entity.skin.identifier;

		// Set the entity to have a custom scale
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntitySkinIDComponent };
