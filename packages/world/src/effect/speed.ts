import { AttributeName, EffectType } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class SpeedEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Speed;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {
    const speedAttribute = entity.getAttribute(AttributeName.Movement);

    if (!speedAttribute) return;
    entity.setAttribute(AttributeName.Movement, speedAttribute.current * (1 + 0.2 * this.amplifier), true);
  }

  onRemove?(entity: T): void {
    const speedAttribute = entity.getAttribute(AttributeName.Movement);

    if (!speedAttribute) return;
    entity.setAttribute(AttributeName.Movement, speedAttribute.current / (1 + 0.2 * this.amplifier));
  }
}

export { SpeedEffect };
