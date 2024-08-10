import { ActorDataId, ActorDataType } from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntitySkinIDComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:skin_id";

	public static readonly types = [EntityIdentifier.Player];

	public readonly key = ActorDataId.SkinId;

	public readonly type = ActorDataType.String;

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
