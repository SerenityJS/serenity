import { ActorFlag } from "@serenityjs/protocol";

import { EntityFlagComponent } from "./flag";

import type { Entity } from "../../../entity";

class EntityRidingComponent extends EntityFlagComponent {
	public static readonly identifier = "minecraft:riding";

	public readonly flag: ActorFlag = ActorFlag.Riding;

	// The default value for the component
	public defaultValue = true;

	public constructor(entity: Entity) {
		super(entity, EntityRidingComponent.identifier);

		// Set the default value for the component.
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntityRidingComponent };
