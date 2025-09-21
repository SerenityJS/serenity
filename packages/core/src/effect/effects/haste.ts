import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class HasteEffect extends Effect {
  public static readonly type: EffectType = EffectType.Haste;
  public color: Color = new Color(67, 255, 255, 7);
}

export { HasteEffect };
