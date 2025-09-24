import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class StrengthEffect extends Effect {
  public static readonly type: EffectType = EffectType.Strength;
  public color: Color = new Color(67, 255, 255, 0);
}

export { StrengthEffect };
