import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetaComponent } from "./meta";

class EntityNametagComponent extends EntityMetaComponent {
	public readonly identifier = "minecraft:nametag";

	public readonly flag = false;

	public readonly key = MetadataKey.Nametag;

	public readonly type = MetadataType.String;

	public defaultValue = "";

	public currentValue = this.defaultValue;
}

export { EntityNametagComponent };
