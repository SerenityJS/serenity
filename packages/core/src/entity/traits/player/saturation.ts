import { AttributeName } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";
import { EntityAttributeTrait } from "../attribute";

class PlayerSaturationTrait extends EntityAttributeTrait {
  public static readonly identifier = "saturation";
  public static readonly types = [EntityIdentifier.Player];

  public attribute: AttributeName = AttributeName.PlayerSaturation;
  public effectiveMax: number = 20;
  public defaultValue: number = 20;
  public effectiveMin: number = 0;
}

export { PlayerSaturationTrait };
