import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class DarknessEffect extends Effect {
  public static readonly type: EffectType = EffectType.Darkness;
  public readonly color: Color = new Color(255, 41, 39, 33);
}

export { DarknessEffect };
