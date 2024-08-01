import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension } from "../world";
import type { Entity } from "../entity";

class EntitySpawnedSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.EntitySpawned;

	public readonly entity: Entity;

	public readonly dimension: Dimension;

	public constructor(entity: Entity, dimension: Dimension) {
		super();
		this.entity = entity;
		this.dimension = dimension;
	}
}

export { EntitySpawnedSignal };
