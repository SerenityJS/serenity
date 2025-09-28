import {
  ActorDamageCause,
  Color,
  EffectType,
  Gamemode
} from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class FatalPoisonEffect extends Effect {
  public static readonly type: EffectType = EffectType.FatalPoison;
  public readonly color: Color = new Color(255, 78, 147, 49);

  public onTick(entity: Entity): void {
    let ticksPerSecond = Math.floor(
      Math.max(25 * Math.pow(0.5, this.amplifier - 1), 12)
    );
    ticksPerSecond = Math.min(ticksPerSecond, 10);

    if (Number(entity.dimension.world.currentTick) % ticksPerSecond != 0)
      return;

    if (entity.isPlayer() && entity.getGamemode() == Gamemode.Creative) return;
    const entityHealth = entity.getTrait(EntityHealthTrait);
    entityHealth.applyDamage(1, undefined, ActorDamageCause.Magic);
  }
}

export { FatalPoisonEffect };
