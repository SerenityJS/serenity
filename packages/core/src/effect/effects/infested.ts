import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class InfestedEffect extends Effect {
  public static readonly type: EffectType = EffectType.Infested;
  public color: Color = new Color(67, 153, 183, 153);
}

export { InfestedEffect };
