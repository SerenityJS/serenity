import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class JumpBoostEffect extends Effect {
  public static readonly type: EffectType = EffectType.JumpBoost;
  public color: Color = new Color(67, 255, 255, 137);
}

export { JumpBoostEffect };
