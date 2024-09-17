import { ActorFlag } from "@serenityjs/protocol";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityIsBabyComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:is_baby";

	public readonly flag = ActorFlag.Baby;

	public defaultValue = false;

	public constructor(entity: Entity) {
		super(entity, EntityIsBabyComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityIsBabyComponent };
