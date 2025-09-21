import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class LevitationEffect extends Effect {
  public static readonly type: EffectType = EffectType.Levitation;
  public color: Color = new Color(67, 255, 255, 255);
}

export { LevitationEffect };
