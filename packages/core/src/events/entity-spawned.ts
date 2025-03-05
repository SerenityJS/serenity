import { WorldEvent } from "../enums";
import { EntitySpawnOptions } from "../types";

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
   * Whether the entity is spawning for the first time.
   */
  public readonly initialSpawn: boolean;

  /**
   * The dimension the entity spawned in.
   */
  public readonly dimension: Dimension;

  /**
   * Whether the entity is spawning due to a dimension change.
   */
  public readonly changedDimensions: boolean;

  /**
   * Creates a new entity spawned signal.
   * @param entity The entity that spawned.
   * @param options The options of the entity spawn.
   */
  public constructor(entity: Entity, options: EntitySpawnOptions) {
    super(entity.world);

    // Assign the properties of the signal.
    this.entity = entity;
    this.initialSpawn = options.initialSpawn;
    this.dimension = options.dimension;
    this.changedDimensions = options.changedDimensions;
  }
}

export { EntitySpawnedSignal };
