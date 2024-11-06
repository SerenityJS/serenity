import { AttributeName } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityAttributeTrait } from "../attribute";

class PlayerExhaustionTrait extends EntityAttributeTrait {
  public static readonly identifier = "exhaustion";
  public static readonly types = [EntityIdentifier.Player];

  public attribute: AttributeName = AttributeName.PlayerExhaustion;
  public effectiveMax: number = 5;
  public defaultValue: number = 0;
  public effectiveMin: number = 0;
}

export { PlayerExhaustionTrait };
