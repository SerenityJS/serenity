import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";
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
	 * If the entity was despawned for a specific player.
	 */
	public readonly player?: Player;

	/**
	 * Creates a new entity despawned signal.
	 * @param entity The entity that despawned.
	 * @param dimension The dimension the entity despawned in.
	 * @param player If the entity was despawned for a specific player.
	 */
	public constructor(entity: Entity, dimension: Dimension, player?: Player) {
		super(entity.dimension.world);
		this.entity = entity;
		this.dimension = dimension;
		this.player = player;
	}
}

export { EntityDespawnedSignal };
