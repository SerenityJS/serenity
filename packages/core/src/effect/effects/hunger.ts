import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class HungerEffect extends Effect {
  public static readonly type: EffectType = EffectType.Hunger;
  public color: Color = new Color(67, 49, 109, 39);
}

export { HungerEffect };
