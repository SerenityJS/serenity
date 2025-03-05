import { WorldEvent } from "../enums";
import { EntityDespawnOptions } from "../types";

import { EventSignal } from "./event-signal";

import type { Dimension } from "../world";
import type { Entity } from "../entity";

/**
 * Signal emitted when an entity despawns.
 */
class EntityDespawnedSignal extends EventSignal {
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
   * If the entity is despawning due to death.
   */
  public readonly hasDied: boolean;

  /**
   * Creates a new entity despawned signal.
   * @param entity The entity that despawned.
   * @param dimension The dimension the entity despawned in.
   */
  public constructor(entity: Entity, options: EntityDespawnOptions) {
    super(entity.dimension.world);

    // Assign the properties of the signal.
    this.entity = entity;
    this.dimension = entity.dimension;
    this.hasDied = options.hasDied;
  }
}

export { EntityDespawnedSignal };
