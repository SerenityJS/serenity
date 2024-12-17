import { ActorDataId, DataItem } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityMetadataUpdateSignal extends EventSignal {
  public readonly identifier = WorldEvent.EntityMetadataUpdate;

  /**
   * The entity in which the metadata was updated.
   */
  public readonly entity: Entity;

  /**
   * The metadata key that was updated.
   */
  public readonly key: ActorDataId;

  /**
   * The new value of the metadata.
   */
  public readonly dataItem: DataItem;

  /**
   * Create a new entity metadata update event.
   * @param entity The entity in which the metadata was updated.
   * @param key The metadata key that was updated.
   * @param dataItem The new value of the metadata.
   */
  public constructor(entity: Entity, key: ActorDataId, dataItem: DataItem) {
    super(entity.world);
    this.entity = entity;
    this.key = key;
    this.dataItem = dataItem;
  }
}

export { EntityMetadataUpdateSignal };
