import { AttributeName, EffectType } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class SlownessEffect<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.Slowness;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {
    const speedAttribute = entity.getAttribute(AttributeName.Movement);

    if (!speedAttribute) return;
    entity.setAttribute(AttributeName.Movement, speedAttribute.current * (1 - 0.15 * this.amplifier), true);
  }

  onRemove?(entity: T): void {
    const speedAttribute = entity.getAttribute(AttributeName.Movement);

    if (!speedAttribute) return;
    entity.setAttribute(AttributeName.Movement, speedAttribute.current / (1 - 0.15 * this.amplifier), true);
  }
}

export { SlownessEffect };
