import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Player } from "../player";
import type { Dimension, World } from "../world";
import type { Entity } from "../entity";

/**
 * Signal emitted when an entity spawns.
 */
class EntitySpawnedSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.EntitySpawned;

	/**
	 * The entity that spawned.
	 */
	public readonly entity: Entity;

	/**
	 * The dimension the entity spawned in.
	 */
	public readonly dimension: Dimension;

	/**
	 * If the entity spawned for a specific player.
	 */
	public readonly player?: Player;

	/**
	 * Creates a new entity spawned signal.
	 * @param entity The entity that spawned.
	 * @param dimension The dimension the entity spawned in.
	 * @param player If the entity spawned for a specific player.
	 */
	public constructor(entity: Entity, dimension: Dimension, player?: Player) {
		super();
		this.entity = entity;
		this.dimension = dimension;
		this.player = player;

		// TODO: WorldEvents experimental - Remove this once the chosen event system is implemented.
		this.emit();
	}

	public getWorld(): World {
		return this.entity.dimension.world;
	}
}

export { EntitySpawnedSignal };
