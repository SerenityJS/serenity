import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class WaterBreathingEffect extends Effect {
  public static readonly type: EffectType = EffectType.WaterBreathing;

  public readonly color: Color = new Color(255, 152, 218, 192);
}

export { WaterBreathingEffect };
