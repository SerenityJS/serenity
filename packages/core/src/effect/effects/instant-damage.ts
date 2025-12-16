import { ActorDamageCause, EffectType, Gamemode } from "@serenityjs/protocol";

import { Entity, EntityHealthTrait } from "../../entity";

import { Effect } from "./effect";

class InstantDamageEffect extends Effect {
  public static readonly type: EffectType = EffectType.InstantDamage;
  public readonly instant: boolean = true;

  public onAdd(entity: Entity): void {
    // TODO: Undead check for healing
    //if (entity)

    if (entity.isPlayer() && entity.getGamemode() == Gamemode.Creative) return;
    const healthTrait = entity.getTrait(EntityHealthTrait);

    if (!healthTrait) return;
    healthTrait.applyDamage(
      3 * 2 ** this.amplifier,
      undefined,
      ActorDamageCause.Magic
    );
  }
}

export { InstantDamageEffect };
