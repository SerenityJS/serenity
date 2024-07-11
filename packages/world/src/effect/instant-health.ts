import { EffectType, Vector3f } from "@serenityjs/protocol";
import { Effect } from "./effect";
import { Entity } from "../entity";

class InstantHealth<T extends Entity> extends Effect {
  public effectType: EffectType = EffectType.InstantHealth;
  public instant: boolean = true;

  onTick?(entity: T): void {}

  onAdd?(entity: T): void {
    const entityHealth = entity.getComponent("minecraft:health");
    const currentValue = entityHealth.getCurrentValue();

    // TODO: Undead check to damage
    if (currentValue >= entityHealth.effectiveMax) return;
    entityHealth.setCurrentValue(Math.min(entityHealth.effectiveMax, currentValue + 2 * 2 ** this.amplifier));
  }

  onRemove?(entity: T): void {}
}

export { InstantHealth };
