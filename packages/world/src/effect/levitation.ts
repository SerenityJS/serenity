import { EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class LevitationEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Levitation;

  onTick?(entity: T): void {
    // Boost speed

    entity.applyImpulse(new Vector3f(0, 0.001, 0));
  }

  onAdd?(entity: T): void {}

  onRemove?(entity: T): void {}
}

export { LevitationEffect };
