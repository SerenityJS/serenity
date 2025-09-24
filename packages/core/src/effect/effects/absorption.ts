import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class AbsorptionEffect extends Effect {
  public static readonly type: EffectType = EffectType.Absorption;
  public color: Color = new Color(67, 0, 37, 203);
}

export { AbsorptionEffect };
