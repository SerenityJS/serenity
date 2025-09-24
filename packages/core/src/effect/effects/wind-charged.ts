import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class WindChargedEffect extends Effect {
  public static readonly type: EffectType = EffectType.WindCharged;
  public color: Color = new Color(67, 251, 255, 255);
}

export { WindChargedEffect };
