import { Effect } from "../effect";
import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EffectAddSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.EffectAdd;

  /**
   * The entity where the effect was added
   */
  public readonly entity: Entity;

  /**
   * The effect that was added.
   */
  public readonly effect: Effect;

  public constructor(entity: Entity, effect: Effect) {
    super(entity.world);
    this.entity = entity;
    this.effect = effect;
  }
}

export { EffectAddSignal };
