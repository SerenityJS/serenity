import { ActorDamageCause } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityHurtSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.EntityHurt;

  /**
   * The entity that was hurt.
   */
  public readonly hurtEntity: Entity;

  /**
   * The entity that hurted the entity, if the damage was caused by an entity.
   */
  public readonly damagingEntity?: Entity;

  /**
   * The amount of damage dealed to the entity.
   */
  public readonly damage: number;

  /**
   * The cause of the damage dealed to the entity
   */
  public readonly cause?: ActorDamageCause;

  public constructor(
    hurtEntity: Entity,
    damage: number,
    cause?: ActorDamageCause,
    damagingEntity?: Entity
  ) {
    super(hurtEntity.world);
    this.hurtEntity = hurtEntity;
    this.damagingEntity = damagingEntity;
    this.damage = damage;
    this.cause = cause;
  }
}

export { EntityHurtSignal };
