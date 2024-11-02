import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class BlindnessEffect extends Effect {
  public static readonly type: EffectType = EffectType.Blindness;
  public readonly color: Color = new Color(255, 31, 31, 35);
}

export { BlindnessEffect };
