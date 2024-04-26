import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

import type { Entity } from "../../../entity";

class EntityAlwaysShowNametagComponent extends EntityMetadataComponent {
	public static readonly identifier = "minecraft:always_show_nametag";

	public readonly flag = false;

	public readonly key = MetadataKey.AlwaysShowNametag;

	public readonly type = MetadataType.Byte;

	public defaultValue = false;

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity always show nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity always show nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityAlwaysShowNametagComponent.identifier);
	}
}

export { EntityAlwaysShowNametagComponent };
