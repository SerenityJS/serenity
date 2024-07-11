import { EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class InvisibilityEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Invisibility;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {
    entity.setVisibility(false);
  }

  onRemove?(entity: T): void {
    entity.setVisibility(true);
  }
}

export { InvisibilityEffect };
