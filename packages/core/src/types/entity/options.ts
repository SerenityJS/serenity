import {
  ActorDamageCause,
  ContainerId,
  ContainerType,
  IPosition
} from "@serenityjs/protocol";

import { Entity } from "../../entity";
import { Dimension } from "../../world";

interface EntityInventoryTraitOptions {
  /**
   * The size of the container.
   */
  size: number;

  /**
   * The type of the container.
   */
  type: ContainerType;

  /**
   * The identifier of the container.
   */
  identifier: ContainerId;
}

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

  /**
   * If the entity is despawning due to a dimension change.
   */
  changedDimensions: boolean;

  /**
   * @note This is only used for players.
   * If the player is disconnecting from the server.
   */
  disconnected?: boolean;
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

  /**
   * Whether to cancel the death event.
   */
  cancel: boolean;
}

interface EntityTeleportOptions {
  /**
   * The position the entity is teleporting from.
   */
  from: IPosition;

  /**
   * The position the entity is teleporting to.
   */
  to: IPosition;

  /**
   * Whether the entity is teleporting due to a dimension change.
   */
  changedDimensions: boolean;
}

export {
  EntityInventoryTraitOptions,
  EntitySpawnOptions,
  EntityDespawnOptions,
  EntityDeathOptions,
  EntityTeleportOptions
};
