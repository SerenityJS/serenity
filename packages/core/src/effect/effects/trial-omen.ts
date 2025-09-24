import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class TrialOmenEffect extends Effect {
  public static readonly type: EffectType = EffectType.TrialOmen;
  public color: Color = new Color(67, 0, 205, 205);
}

export { TrialOmenEffect };
