import { EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class BlindnessEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Blindness;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {}

  onRemove?(entity: T): void {}
}

export { BlindnessEffect };
