import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class WeaknessEffect extends Effect {
  public static readonly type: EffectType = EffectType.Weakness;
  public color: Color = new Color(67, 17, 27, 17);
}

export { WeaknessEffect };
