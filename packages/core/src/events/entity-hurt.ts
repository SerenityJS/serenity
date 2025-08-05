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
   * The cause of the damage dealed to the entity
   */
  public cause?: ActorDamageCause;

  /**
   * The amount of damage dealed to the entity.
   */
  public amount: number;

  public constructor(
    hurtEntity: Entity,
    amount: number,
    cause?: ActorDamageCause,
    damagingEntity?: Entity
  ) {
    super(hurtEntity.world);
    this.hurtEntity = hurtEntity;
    this.damagingEntity = damagingEntity;
    this.amount = amount;
    this.cause = cause;
  }
}

export { EntityHurtSignal };
