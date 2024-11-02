import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class NauseasEffect extends Effect {
  public static readonly type: EffectType = EffectType.Nausea;
  public readonly color: Color = new Color(255, 85, 29, 74);
}

export { NauseasEffect };
