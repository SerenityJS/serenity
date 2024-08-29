import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension } from "../world";
import type { Entity } from "../entity";

/**
 * Signal emitted when an entity despawns.
 */
class EntityDespawnedSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.EntityDespawned;

	/**
	 * The entity that despawned.
	 */
	public readonly entity: Entity;

	/**
	 * The dimension the entity despawned in.
	 */
	public readonly dimension: Dimension;

	/**
	 * Creates a new entity despawned signal.
	 * @param entity The entity that despawned.
	 * @param dimension The dimension the entity despawned in.
	 */
	public constructor(entity: Entity, dimension: Dimension) {
		super(entity.dimension.world);
		this.entity = entity;
		this.dimension = dimension;
	}
}

export { EntityDespawnedSignal };
