import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

class EntityNametagComponent extends EntityMetadataComponent {
	public readonly identifier = "minecraft:nametag";

	public readonly flag = false;

	public readonly key = MetadataKey.Nametag;

	public readonly type = MetadataType.String;

	public defaultValue = "";

	public currentValue = this.defaultValue;
}

export { EntityNametagComponent };
