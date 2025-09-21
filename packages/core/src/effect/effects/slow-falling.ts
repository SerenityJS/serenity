import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class SlowFallingEffect extends Effect {
  public static readonly type: EffectType = EffectType.SlowFalling;
  public color: Color = new Color(67, 255, 255, 243);
}

export { SlowFallingEffect };
