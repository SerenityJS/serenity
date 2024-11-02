import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class NightVisionEffect extends Effect {
  public static readonly type: EffectType = EffectType.NightVision;
  public color: Color = new Color(255, 31, 31, 161);
}

export { NightVisionEffect };
