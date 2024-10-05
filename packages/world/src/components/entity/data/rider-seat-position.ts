import { ActorDataId, ActorDataType, Vector3f } from "@serenityjs/protocol";

import { EntityDataComponent } from "./data";

import type { Entity } from "../../../entity";

class EntitySeatPositionComponent extends EntityDataComponent {
	public static readonly identifier = "minecraft:seat_position";

	public readonly key: ActorDataId = ActorDataId.Reserved056;

	public readonly type = ActorDataType.Vec3;

	public defaultValue: Vector3f = new Vector3f(0, 0, 0);

	public constructor(entity: Entity) {
		super(entity, EntitySeatPositionComponent.identifier);
		this.setCurrentValue(this.defaultValue, false);
	}
}

export { EntitySeatPositionComponent };
