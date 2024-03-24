import { MetadataFlags, MetadataType } from "@serenityjs/protocol";

import { EntityMetadataComponent } from "./meta";

class EntityBreathingComponent extends EntityMetadataComponent {
	public readonly identifier = "minecraft:breathing";

	public readonly flag = true;

	public readonly key = MetadataFlags.Breathing;

	public readonly type = MetadataType.Long;

	public defaultValue = true;

	public currentValue = this.defaultValue;
}

export { EntityBreathingComponent };
