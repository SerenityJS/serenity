import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../../enums";

import { EntityFlagTrait } from "./flag";

class EntityHasGravityTrait extends EntityFlagTrait {
  public static readonly identifier = "has_gravity";

  public static readonly types = [EntityIdentifier.Player];

  public readonly flag = ActorFlag.HasGravity;

  public readonly defaultValue = true;
}

export { EntityHasGravityTrait };
