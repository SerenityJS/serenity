import {
  ActorDataId,
  DataItem,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { EntityMetadataUpdateSignal } from "../../events";

class MetadataMap extends Map<ActorDataId, DataItem> {
  /**
   * The entity that this metadata set is attached to
   */
  protected readonly entity: Entity;

  /**
   * Create a new metadata set
   * @param entity The entity that this metadata set is attached to
   */
  public constructor(entity: Entity) {
    super();
    this.entity = entity;
  }

  public get<T = unknown>(key: ActorDataId): DataItem<T> {
    return super.get(key) as DataItem<T>;
  }

  public set(key: ActorDataId, value: DataItem<unknown>): this {
    // Create a new EntityMetadataUpdateSignal
    const signal = new EntityMetadataUpdateSignal(this.entity, key, value);

    // If the signal was cancelled, return this
    if (!signal.emit()) return this;

    // Call the original set method
    const result = super.set(key, signal.dataItem);

    // Update the actor data when a new value is added
    this.update();

    // Return the result
    return result;
  }

  public delete(key: ActorDataId): boolean {
    // Call the original delete method
    const result = super.delete(key);

    // Update the actor data when a value is deleted
    this.update();

    // Return the result
    return result;
  }

  public clear(): void {
    // Call the original clear method
    super.clear();

    // Update the actor data when the set is cleared
    this.update();
  }

  /**
   * Update the actor data of the entity.
   */
  public update(): void {
    // Create a new SetActorDataPacket
    const packet = new SetActorDataPacket();
    packet.runtimeEntityId = this.entity.runtimeId;
    packet.inputTick = this.entity.isPlayer()
      ? this.entity.inputTick
      : this.entity.dimension.world.currentTick;
    packet.data = [...this.entity.metadata.values()];
    packet.properties = new PropertySyncData([], []);

    // Iterate over the flags set on the entity
    for (const [flag, enabled] of this.entity.flags)
      packet.setActorFlag(flag, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { MetadataMap };
