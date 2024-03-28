import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { Entity } from "../../../entity";

import { EntityMetadataComponent } from "./meta";

class EntityNametagComponent extends EntityMetadataComponent {
	public readonly flag = false;

	public readonly key = MetadataKey.Nametag;

	public readonly type = MetadataType.String;

	public defaultValue = "";

	public currentValue = this.defaultValue;

	/**
	 * Creates a new entity nametag component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity nametag component.
	 */
	public constructor(entity: Entity) {
		super(entity, "minecraft:nametag");
	}
}

export { EntityNametagComponent };
