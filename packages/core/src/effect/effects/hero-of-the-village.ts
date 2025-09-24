import { Color, EffectType } from "@serenityjs/protocol";

import { Effect } from "./effect";

class HeroOfTheVillageEffect extends Effect {
  public static readonly type: EffectType = EffectType.HeroOfTheVillage;
  public color: Color = new Color(67, 9, 255, 9);
}

export { HeroOfTheVillageEffect };
