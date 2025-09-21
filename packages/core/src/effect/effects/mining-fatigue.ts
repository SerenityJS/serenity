import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class MiningFatigueEffect extends Effect {
  public static readonly type: EffectType = EffectType.MiningFatigue;
  public color: Color = new Color(67, 21, 5, 0);
}

export { MiningFatigueEffect };
