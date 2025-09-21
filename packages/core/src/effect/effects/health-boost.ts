import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class HealthBoostEffect extends Effect {
  public static readonly type: EffectType = EffectType.HealthBoost;
  public color: Color = new Color(67, 255, 123, 0);
}

export { HealthBoostEffect };
