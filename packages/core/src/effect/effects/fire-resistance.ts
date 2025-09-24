import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class FireResistanceEffect extends Effect {
  public static readonly type: EffectType = EffectType.FireResistance;
  public color: Color = new Color(67, 255, 179, 0);
}

export { FireResistanceEffect };
