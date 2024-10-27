import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

import type { Dimension } from "../world";
import type { Entity } from "../entity";

/**
 * Signal emitted when an entity spawns.
 */
class EntitySpawnedSignal extends EventSignal {
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
   * Creates a new entity spawned signal.
   * @param entity The entity that spawned.
   * @param dimension The dimension the entity spawned in.
   */
  public constructor(entity: Entity, dimension: Dimension) {
    super(entity.dimension.world);
    this.entity = entity;
    this.dimension = dimension;
  }
}

export { EntitySpawnedSignal };
