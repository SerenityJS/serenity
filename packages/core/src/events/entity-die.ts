import { ActorDamageCause } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";
import { EntityDeathOptions } from "..";

import { EventSignal } from "./event-signal";

class EntityDiedSignal extends EventSignal {
  public static readonly identifier: WorldEvent = WorldEvent.EntityDied;

  /**
   * The entity that died.
   */
  public readonly targetEntity: Entity;

  /**
   * The entity that killed the entity, only if the death was caused by an entity.
   */
  public readonly killerSource: Entity | null;

  /**
   * The last damage cause before the entity death.
   */
  public readonly damageCause: ActorDamageCause;

  /**
   * Creates a new entity died signal.
   * @param entity The entity that died.
   * @param options The options of the entity death.
   */
  public constructor(entity: Entity, options: EntityDeathOptions) {
    super(entity.world);

    // Assign the properties of the signal.
    this.targetEntity = entity;
    this.killerSource = options.killerSource;
    this.damageCause = options.damageCause;
  }
}

export { EntityDiedSignal };
