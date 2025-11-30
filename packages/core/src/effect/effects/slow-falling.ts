import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class SlowFallingEffect extends Effect {
  public static readonly type: EffectType = EffectType.SlowFalling;

  public readonly color: Color = new Color(255, 239, 209, 255);
}

export { SlowFallingEffect };
