import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class WeavingEffect extends Effect {
  public static readonly type: EffectType = EffectType.Weaving;
  public color: Color = new Color(67, 113, 83, 53);
}

export { WeavingEffect };
