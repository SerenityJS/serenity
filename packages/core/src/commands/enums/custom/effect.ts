import { CustomEnum } from ".";
import { EffectType } from "@serenityjs/protocol";

const keys = Object.keys(EffectType)
const identifiers = keys.filter(key => isNaN(Number(key)));

class EffectEnum extends CustomEnum {
  public static readonly identifier = "effects";
  public static readonly options = identifiers;
}

export { EffectEnum };
