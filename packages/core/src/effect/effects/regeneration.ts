import { Color, EffectType } from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class RegenerationEffect extends Effect {
  public static readonly type: EffectType = EffectType.Regeneration;

  public readonly color: Color = new Color(255, 205, 92, 171);

  public onTick(entity: Entity): void {
    // Get the entity health trait.
    const entityHealth = entity.getTrait(EntityHealthTrait);

    // If the entity doesn't have a health trait, means that the entity can't
    // Be healed.
    if (!entityHealth) return;
    // Compute the effect timings.
    const ticksPerSecond = Math.max(
      50 / 2 ** (this.amplifier - 1),
      1 * 2 ** (this.amplifier - 5)
    );

    // Check if we can heal in the current tick.
    if (Number(entity.world.currentTick) % ticksPerSecond != 0) return;

    // Heal the entity by 1 health point.
    entityHealth.currentValue = entityHealth.currentValue + 1;
  }
}

export { RegenerationEffect };
