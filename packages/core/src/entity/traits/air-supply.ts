import { ActorFlag } from "@serenityjs/protocol";

import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityAirSupplyTrait extends EntityTrait {
  public static readonly identifier = "air_supply";

  public static readonly types = [EntityIdentifier.Player];

  public onTick(): void {
    // TODO: Implement air supply trait logic
  }

  public onSpawn(): void {
    // Check if the entity has a metadata flag value for gravity
    if (!this.entity.flags.has(ActorFlag.Breathing)) {
      // Set the entity flag for gravity
      this.entity.flags.set(ActorFlag.Breathing, true);
    }
  }
}

export { EntityAirSupplyTrait };
