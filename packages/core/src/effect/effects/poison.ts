import {
  EffectType,
  Color,
  Gamemode,
  ActorDamageCause
} from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class PoisonEffect extends Effect {
  public static type: EffectType = EffectType.Poison;
  public static instant: boolean = false;
  public color: Color = new Color(255, 78, 147, 49);

  public onTick?(entity: Entity): void {
    let ticksPerSecond = Math.floor(
      Math.max(25 * Math.pow(0.5, this.amplifier - 1), 12)
    );
    ticksPerSecond = Math.min(ticksPerSecond, 10);

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
      return;
    if (entity.isPlayer() && entity.getGamemode() == Gamemode.Creative) return;
    const entityHealth = entity.getTrait(EntityHealthTrait);

    if (entityHealth.currentValue <= 1) return;
    entityHealth.applyDamage(1, undefined, ActorDamageCause.Magic);
  }
}

export { PoisonEffect };
