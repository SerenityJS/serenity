import {
  ActorDataId,
  DataItem,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";
import { EntityMetadataUpdateSignal } from "../../events";
import { AsyncMap } from "../../utility/async-map";

class MetadataMap extends AsyncMap<ActorDataId, DataItem> {
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

  public async set(key: ActorDataId, value: DataItem<unknown>): Promise<this> {
    // Create a new EntityMetadataUpdateSignal
    const signal = new EntityMetadataUpdateSignal(this.entity, key, value);

    // If the signal was cancelled, return this
    if (!(await signal.emit())) return this;

    // Call the original set method
    await super.set(key, signal.dataItem);

    // Update the actor data when a new value is added
    await this.update();

    // Return the result
    return this;
  }

  public async delete(key: ActorDataId): Promise<boolean> {
    // Call the original delete method
    const result = super.delete(key);

    // Update the actor data when a value is deleted
    await this.update();

    // Return the result
    return result;
  }

  public async clear(): Promise<void> {
    // Call the original clear method
    await super.clear();

    // Update the actor data when the set is cleared
    return this.update();
  }

  /**
   * Update the actor data of the entity.
   */
  public async update(): Promise<void> {
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
    await this.entity.dimension.broadcast(packet);
  }
}

export { MetadataMap };
