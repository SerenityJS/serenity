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

export { EntitySpawnOptions, EntityDespawnOptions };
