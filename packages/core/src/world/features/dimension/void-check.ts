import { ActorDamageCause, Gamemode } from "@serenityjs/protocol";

import { EntityHealthTrait } from "../../../entity";
import { FeatureOnTickDetails } from "../feature";

import { DimensionFeature } from "./feature";

class VoidCheck extends DimensionFeature {
  public static readonly identifier = "void_check";

  public onTick({ currentTick }: FeatureOnTickDetails): void {
    const entities = this.dimension.getEntities();

    for (const entity of entities) {
      // Check if the entity is below y = -70
      if (entity.position.y < -70) {
        // If the entity is a player and it's been 20 ticks (1 second), apply void damage
        if (entity.isPlayer() && currentTick % 20n === 0n) {
          // Check if the player is in creative mode or spectator mode
          const gamemode = entity.getGamemode(); // Fetch the player's gamemode
          if (gamemode === Gamemode.Creative || gamemode === Gamemode.Spectator)
            continue;

          // Get the EntityHealthTrait of the player
          const health = entity.getTrait(EntityHealthTrait);

          // Apply 4 points of void damage to the player
          health.applyDamage(4, undefined, ActorDamageCause.Void);
        } else if (!entity.isPlayer()) {
          // Otherwise despawn the entity
          entity.despawn();
        }
      }
    }
  }
}

export { VoidCheck };
