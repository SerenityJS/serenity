import { Color, EffectType, Gamemode } from "@serenityjs/protocol";
import { PlayerHungerTrait } from "../../entity";

import { Effect } from "./effect";
import { Entity } from "../../entity";

class HungerEffect extends Effect {
  public static readonly type: EffectType = EffectType.Hunger;
  public color: Color = new Color(67, 49, 109, 39);

  public onTick?(entity: Entity): void {
    if (entity.dimension.world.currentTick % 5n !== 0n) return;
    if (!entity.isPlayer() || entity.getGamemode() == Gamemode.Creative) return;
    const entityHunger = entity.getTrait(PlayerHungerTrait);

    if (entityHunger.currentValue <= 1) return;
    entityHunger.exhaustion += (0.025 * (this.amplifier + 1));
  }
}

export { HungerEffect };
