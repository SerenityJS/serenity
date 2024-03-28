import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityAlwaysShowNametagComponent extends EntityMetadataComponent {
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
		super(entity, "minecraft:always_show_nametag");
	}
}

export { EntityAlwaysShowNametagComponent };
