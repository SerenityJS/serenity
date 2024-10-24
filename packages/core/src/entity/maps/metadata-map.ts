import {
  ActorDataId,
  DataItem,
  PropertySyncData,
  SetActorDataPacket
} from "@serenityjs/protocol";

import { Entity } from "../entity";

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

  public set(key: ActorDataId, value: DataItem<unknown>): this {
    // Call the original set method
    const result = super.set(key, value);

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
      packet.setFlag(flag, enabled);

    // Send the packet to the dimension
    this.entity.dimension.broadcast(packet);
  }
}

export { MetadataMap };
