import { ActorDataId, ActorDataType } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntityAlwaysShowNametagComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:always_show_nametag";

	public readonly key = ActorDataId.NametagAlwaysShow;

	public readonly type = ActorDataType.Byte;

	public defaultValue = 1;

	/**
	 * Creates a new entity always show nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity always show nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityAlwaysShowNametagComponent.identifier);

		// Set the entity to always show nametag
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityAlwaysShowNametagComponent };
