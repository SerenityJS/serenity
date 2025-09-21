import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class ResistanceEffect extends Effect {
  public static readonly type: EffectType = EffectType.Resistance;
  public color: Color = new Color(67, 163, 13, 255);
}

export { ResistanceEffect };
