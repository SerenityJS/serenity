import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class SaturationEffect extends Effect {
  public static readonly type: EffectType = EffectType.Saturation;
  public color: Color = new Color(67, 255, 0, 0);
}

export { SaturationEffect };
