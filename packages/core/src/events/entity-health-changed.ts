import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityHealthChangedSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.HealthChanged;

  /**
   * The entity which health changed.
   */
  public readonly entity: Entity;

  /**
   * The previous health value.
   */
  public readonly fromHealth: number;

  /**
   * The new health value.
   */
  public readonly toHealth: number;

  public constructor(entity: Entity, fromHealth: number, toHealth: number) {
    super(entity.world);
    this.entity = entity;
    this.fromHealth = fromHealth;
    this.toHealth = toHealth;
  }
}

export { EntityHealthChangedSignal };
