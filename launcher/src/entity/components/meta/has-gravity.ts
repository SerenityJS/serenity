import { MetadataFlags, MetadataType } from "@serenityjs/protocol";

import { EntityMetaComponent } from "./meta";

class EntityHasGravityComponent extends EntityMetaComponent {
	public readonly identifier = "minecraft:has_gravity";

	public readonly flag = true;

	public readonly key = MetadataFlags.AffectedByGravity;

	public readonly type = MetadataType.Long;

	public defaultValue = true;

	public currentValue = this.defaultValue;
}

export { EntityHasGravityComponent };
