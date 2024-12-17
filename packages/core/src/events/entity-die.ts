import { ActorDamageCause } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityDieSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.EntityDie;

  /**
   * The entity that died.
   */
  public readonly entity: Entity;

  /**
   * The entity that killed the entity, only if the death was caused by an entity.
   */
  public readonly damagingEntity?: Entity;

  /**
   * The last damage cause before the entity death.
   */
  public readonly damageCause?: ActorDamageCause;

  public constructor(
    entity: Entity,
    damagingEntity?: Entity,
    damageCause?: ActorDamageCause
  ) {
    super(entity.world);
    this.entity = entity;
    this.damagingEntity = damagingEntity;
    this.damageCause = damageCause;
  }
}

export { EntityDieSignal };
