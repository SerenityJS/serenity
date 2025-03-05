import { ActorDamageCause } from "@serenityjs/protocol";

import { Entity } from "../../entity";
import { Dimension } from "../../world";

interface EntitySpawnOptions {
  /**
   * Whether the entity is spawning for the first time.
   */
  initialSpawn: boolean;

  /**
   * The dimension the entity is spawning in.
   */
  dimension: Dimension;

  /**
   * Whether the entity is spawning due to a dimension change.
   */
  changedDimensions: boolean;
}

interface EntityDespawnOptions {
  /**
   * If the entity is despawning due to death.
   */
  hasDied: boolean;
}

interface EntityDeathOptions {
  /**
   * The source entity that killed the target entity.
   */
  killerSource: Entity | null;

  /**
   * The cause of the damage that killed the target entity.
   */
  damageCause: ActorDamageCause;
}

export { EntitySpawnOptions, EntityDespawnOptions, EntityDeathOptions };
