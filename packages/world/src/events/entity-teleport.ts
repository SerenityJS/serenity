import { WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { Dimension, World } from "../world";
import type { Vector3f } from "@serenityjs/protocol";
import type { Entity } from "../entity";

class EntityTeleportSignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.EntityTeleport;

	/**
	 * The entity thats being teleported.
	 */
	public readonly entity: Entity;

	/**
	 * The position the entity is being teleported to.
	 */
	public readonly position: Vector3f;

	/**
	 * If the entity is being teleported to a specific dimension.
	 */
	public readonly dimension?: Dimension;

	/**
	 * Creates a new entity teleport signal.
	 * @param entity The entity thats being teleported.
	 * @param position The position the entity is being teleported to.
	 * @param dimension If the entity is being teleported to a specific dimension.
	 */
	public constructor(
		entity: Entity,
		position: Vector3f,
		dimension?: Dimension
	) {
		super(entity.dimension.world);
		this.entity = entity;
		this.position = position;
		this.dimension = dimension;
	}

	public getWorld(): World {
		return this.entity.dimension.world;
	}
}

export { EntityTeleportSignal };
