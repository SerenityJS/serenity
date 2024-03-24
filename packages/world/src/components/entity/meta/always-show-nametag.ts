import { MetadataKey, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

class EntityAlwaysShowNametagComponent extends EntityMetadataComponent {
	public readonly identifier = "minecraft:always_show_nametag";

	public readonly flag = false;

	public readonly key = MetadataKey.AlwaysShowNametag;

	public readonly type = MetadataType.Byte;

	public defaultValue = false;

	public currentValue = this.defaultValue;
}

export { EntityAlwaysShowNametagComponent };
