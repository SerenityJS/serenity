import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class ConduitPowerEffect extends Effect {
  public static readonly type: EffectType = EffectType.ConduitPower;
  public color: Color = new Color(67, 0, 255, 255);
}

export { ConduitPowerEffect };
