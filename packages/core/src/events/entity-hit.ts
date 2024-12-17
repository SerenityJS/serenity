import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityHitSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.EntityHit;

  /**
   * The entity that was hit.
   */
  public readonly hitEntity: Entity;

  /**
   * The entity that hitted the other entity.
   */
  public readonly damagingEntity: Entity;

  public constructor(damagingEntity: Entity, hitEntity: Entity) {
    super(damagingEntity.world);
    this.damagingEntity = damagingEntity;
    this.hitEntity = hitEntity;
  }
}

export { EntityHitSignal };
