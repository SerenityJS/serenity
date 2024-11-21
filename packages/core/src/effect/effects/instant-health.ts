import { EffectType } from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class InstantHealthEffect extends Effect {
  public static readonly type: EffectType = EffectType.InstantHealth;
  public static readonly instant: boolean = true;

  public onAdd(entity: Entity): void {
    const healthTrait = entity.getTrait(EntityHealthTrait);
    const currentHealth = healthTrait.currentValue;

    // TODO: Undead check to damage
    if (currentHealth >= healthTrait.maximumValue) return;

    // Set the health to the maximum value.
    healthTrait.currentValue = Math.min(
      healthTrait.maximumValue,
      currentHealth + 2 * 2 ** this.amplifier
    );
  }
}

export { InstantHealthEffect };
