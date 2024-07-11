import { EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class NauseasEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Nausea;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {}

  onRemove?(entity: T): void {}
}

export { NauseasEffect };
