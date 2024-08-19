import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension, World } from "../world";
import type { Entity } from "../entity";

/**
 * Signal emitted when an entity dies.
 */
class EntityDieSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.EntityDie;

	/**
	 * The entity that died
	 */
	public readonly entity: Entity;

	/**
	 * The dimension the entity died in.
	 */
	public readonly dimension: Dimension;

	/**
	 * If the entity died for a specific entity.
	 */
	public readonly attacker?: Entity;

	/**
	 * Creates a new entity died signal.
	 * @param entity The entity that died.
	 * @param dimension The dimension the entity spawned in.
	 * @param attacker If the entity died for a specific entity.
	 */
	public constructor(entity: Entity, dimension: Dimension, attacker?: Entity) {
		super();
		this.entity = entity;
		this.dimension = dimension;
		this.attacker = attacker;

		// TODO: WorldEvents experimental - Remove this once the chosen event system is implemented.
		this.emit();
	}

	public getWorld(): World {
		return this.entity.dimension.world;
	}
}

export { EntityDieSignal };
