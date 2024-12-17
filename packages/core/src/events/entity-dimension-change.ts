import { Entity } from "../entity";
import { WorldEvent } from "../enums";
import { Dimension } from "../world";

import { EventSignal } from "./event-signal";

class EntityDimensionChangeSignal extends EventSignal {
  public static readonly identifier: WorldEvent =
    WorldEvent.EntityDimensionChange;

  /**
   * The entity that changed dimensions.
   */
  public readonly entity: Entity;

  /**
   * The dimension the entity moved to.
   */
  public readonly fromDimension: Dimension;

  /**
   * The dimension the entity moved from.
   */
  public readonly toDimension: Dimension;

  public constructor(
    entity: Entity,
    fromDimension: Dimension,
    toDimension: Dimension
  ) {
    super(entity.world);
    this.entity = entity;
    this.fromDimension = fromDimension;
    this.toDimension = toDimension;
  }
}

export { EntityDimensionChangeSignal };
