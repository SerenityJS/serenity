import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class BadOmenEffect extends Effect {
  public static readonly type: EffectType = EffectType.BadOmen;
  public color: Color = new Color(67, 0, 67, 0);
}

export { BadOmenEffect };
