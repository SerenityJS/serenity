import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class OozingEffect extends Effect {
  public static readonly type: EffectType = EffectType.Oozing;
  public color: Color = new Color(67, 179, 255, 199);
}

export { OozingEffect };
